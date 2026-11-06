import { Hono } from 'hono';

import type {
  OnAppInstallRequest,
  OnCommentCreateRequest,
  TriggerResponse,
} from '@devvit/web/shared';

import { context, reddit, redis } from '@devvit/web/server';

import { createPost } from '../core/post';

export const triggers = new Hono();

const MAX_ITEM_LENGTH = 100;

/*
 * Existing app-install trigger.
 *
 * This preserves the prayer-report feature in core/post.ts.
 */
triggers.post('/on-app-install', async (c) => {
  try {
    const post = await createPost();
    const input = await c.req.json<OnAppInstallRequest>();

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message:
          `Post created in subreddit ${context.subredditName} ` +
          `with id ${post.id} (trigger: ${input.type})`,
      },
      200
    );
  } catch (error) {
    console.error('Error creating prayer report:', error);

    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: 'Failed to create prayer report',
      },
      400
    );
  }
});

/*
 * Handles newly created comments.
 */
triggers.post('/on-comment-create', async (c) => {
  try {
    const input = await c.req.json<OnCommentCreateRequest>();
    const commentId = input.comment?.id;

    if (!commentId || !commentId.startsWith('t1_')) {
      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'Skipping invalid comment ID',
        },
        200
      );
    }

    /*
     * Fetch the latest version of the comment from Reddit.
     */
    const comment = await reddit.getCommentById(
      commentId as `t1_${string}`
    );

    const commentBody = comment.body.trim();
    const normalizedBody = commentBody.toLowerCase();

    /*
     * Prevent the bot from responding to itself.
     */
    const currentUsername = await reddit.getCurrentUsername();

    if (
      currentUsername &&
      comment.authorName.toLowerCase() ===
        currentUsername.toLowerCase()
    ) {
      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'Ignored a comment written by the app',
        },
        200
      );
    }

    /*
     * Feature 1:
     * Reply "Amen" once per Reddit post.
     */
    if (normalizedBody === 'amen') {
      const amenRedisKey = `amen-replied:${comment.postId}`;
      const alreadyReplied = await redis.get(amenRedisKey);

      if (alreadyReplied) {
        return c.json<TriggerResponse>(
          {
            status: 'success',
            message: 'Amen was already posted in this thread',
          },
          200
        );
      }

      const amenReply = await comment.reply({
        text: 'Amen',
      });

      await redis.set(amenRedisKey, amenReply.id);

      console.log(
        `Amen reply ${amenReply.id} posted in ${comment.postId}.`
      );

      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'Amen reply posted',
        },
        200
      );
    }

    /*
     * Feature 2:
     * Dynamic item request.
     *
     * Example:
     * u/prayforothers please give me a coffee
     */
    const itemRequestPattern =
      /(?:u\/)?prayforothers[\s,.:;!?-]*please\s+give\s+me\s+(.+)/i;

    const itemMatch = commentBody.match(itemRequestPattern);

    if (!itemMatch) {
      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'Comment did not match an app command',
        },
        200
      );
    }

    const capturedItem = itemMatch[1];

    if (!capturedItem) {
      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'No requested item was provided',
        },
        200
      );
    }

    const requestedItem = cleanRequestedItem(capturedItem);

    if (!requestedItem) {
      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'No requested item was provided',
        },
        200
      );
    }

    /*
     * Remove leading articles so:
     * "a coffee" => "coffee"
     * "an apple" => "apple"
     * "the sandwich" => "sandwich"
     * "some encouragement" => "encouragement"
     */
    const responseItem = requestedItem.replace(
      /^(?:a|an|the|some)\s+/i,
      ''
    );

    if (requestedItem.length > MAX_ITEM_LENGTH) {
      await comment.reply({
        text:
          `Hey u/${comment.authorName}, that request is too long. ` +
          `Please request an item using ${MAX_ITEM_LENGTH} characters or fewer.`,
      });

      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'Requested item was too long',
        },
        200
      );
    }

    /*
     * Reply only once per request comment.
     */
    const itemRedisKey = `item-replied:${comment.id}`;
    const alreadyAnswered = await redis.get(itemRedisKey);

    if (alreadyAnswered) {
      return c.json<TriggerResponse>(
        {
          status: 'success',
          message: 'This item request was already answered',
        },
        200
      );
    }

    const itemReply = await comment.reply({
      text:
        `Hey u/${comment.authorName}, here is your ` +
        `${responseItem}.`,
    });

    await redis.set(itemRedisKey, itemReply.id);

    console.log(
      `Item reply ${itemReply.id} posted for request ${comment.id}: ${responseItem}`
    );

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: 'Item request reply posted',
      },
      200
    );
  } catch (error) {
    console.error('Comment trigger error:', error);

    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: 'Failed to process comment',
      },
      400
    );
  }
});

/*
 * Cleans the captured item while preserving normal words.
 */
const cleanRequestedItem = (value: string): string => {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .trim();
};
