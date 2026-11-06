import { context, reddit } from '@devvit/web/server';

const DAYS_TO_SEARCH = 30;
const MAX_POSTS_TO_SCAN = 1000;
const REPORT_TITLE_PREFIX = 'Unanswered Posts Report';

const SOURCE_SUBREDDIT = 'PrayerRequests';

export const createPost = async () => {
  const reportSubreddit = context.subredditName;

  if (!reportSubreddit) {
    throw new Error('The current subreddit name is unavailable.');
  }

  const cutoffDate = new Date(
    Date.now() - DAYS_TO_SEARCH * 24 * 60 * 60 * 1000
  );

  const unansweredPosts: Array<{
    title: string;
    permalink: string;
    createdAt: Date;
  }> = [];

  const posts = reddit.getNewPosts({
    subredditName: SOURCE_SUBREDDIT,
    limit: MAX_POSTS_TO_SCAN,
    pageSize: 100,
  });

  for await (const post of posts) {
    if (post.createdAt < cutoffDate) {
      break;
    }

    if (post.title.startsWith(REPORT_TITLE_PREFIX)) {
      continue;
    }

    if (post.numberOfComments === 0) {
      unansweredPosts.push({
        title: post.title,
        permalink: post.permalink,
        createdAt: post.createdAt,
      });
    }
  }

  unansweredPosts.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const reportLines: string[] = [
    `# Unanswered Posts from r/${SOURCE_SUBREDDIT}`,
    '',
    `Found **${unansweredPosts.length}** post${
      unansweredPosts.length === 1 ? '' : 's'
    } in r/${SOURCE_SUBREDDIT} that received no comments during the last ${DAYS_TO_SEARCH} days.`,
    '',
  ];

  if (unansweredPosts.length === 0) {
    reportLines.push(
      `No unanswered posts were found in r/${SOURCE_SUBREDDIT}.`
    );
  } else {
    unansweredPosts.forEach((post, index) => {
      const date = post.createdAt.toISOString().slice(0, 10);
      const postUrl = `https://www.reddit.com${post.permalink}`;

      reportLines.push(
        `## ${index + 1}. ${post.title}`,
        '',
        `Link: ${postUrl}`,
        '',
        `Posted: ${date}`,
        '',
        '---',
        ''
      );
    });
  }

  reportLines.push(
    '',
    `Source subreddit: r/${SOURCE_SUBREDDIT}`,
    `Report posted in: r/${reportSubreddit}`
  );

  return await reddit.submitPost({
    subredditName: reportSubreddit,
    title: `${REPORT_TITLE_PREFIX} (${unansweredPosts.length})`,
    text: reportLines.join('\n'),
  });
};