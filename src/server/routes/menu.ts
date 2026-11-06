import { Hono } from 'hono';

import type { UiResponse } from '@devvit/web/shared';

import { context } from '@devvit/web/server';

import {
  createPost,
  deleteAllPrayerReports,
} from '../core/post';

export const menu = new Hono();

/*
 * Generate a new prayer report.
 */
menu.post('/post-create', async (c) => {
  try {
    const post = await createPost();

    const subredditName = context.subredditName;

    if (!subredditName) {
      throw new Error('The current subreddit name is unavailable.');
    }

    return c.json<UiResponse>(
      {
        navigateTo:
          `https://reddit.com/r/${subredditName}/comments/` +
          post.id.replace(/^t3_/, ''),
      },
      200
    );
  } catch (error) {
    console.error('Error creating prayer report:', error);

    return c.json<UiResponse>(
      {
        showToast: 'Failed to create prayer report',
      },
      400
    );
  }
});

/*
 * Delete every tracked prayer report created by this app
 * in the current subreddit.
 */
menu.post('/delete-reports', async (c) => {
  try {
    const result = await deleteAllPrayerReports();

    if (
      result.deleted === 0 &&
      result.unavailable === 0 &&
      result.failed === 0
    ) {
      return c.json<UiResponse>(
        {
          showToast: 'No tracked prayer reports were found',
        },
        200
      );
    }

    const reportWord =
      result.deleted === 1 ? 'report' : 'reports';

    let message =
      `Deleted ${result.deleted} prayer ${reportWord}.`;

    if (result.unavailable > 0) {
      message +=
        ` Cleared ${result.unavailable} invalid or untracked ` +
        `entr${result.unavailable === 1 ? 'y' : 'ies'}.`;
    }

    if (result.failed > 0) {
      message +=
        ` ${result.failed} report${
          result.failed === 1 ? '' : 's'
        } could not be loaded or may already have been deleted.`;
    }

    return c.json<UiResponse>(
      {
        showToast: message,
      },
      200
    );
  } catch (error) {
    console.error('Error deleting prayer reports:', error);

    return c.json<UiResponse>(
      {
        showToast: 'Failed to delete prayer reports',
      },
      400
    );
  }
});
