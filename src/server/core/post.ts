import { context, reddit, redis } from '@devvit/web/server';

const DAYS_TO_SEARCH = 30;
const MAX_POSTS_TO_SCAN = 1000;
const REPORT_TITLE_PREFIX = 'Unanswered Posts Report';
const REPORT_REDIS_PREFIX = 'prayer-reports';

const SOURCE_SUBREDDIT = 'PrayerRequests';

const getReportRedisKey = (subredditName: string): string => {
  return `${REPORT_REDIS_PREFIX}:${subredditName.toLowerCase()}`;
};

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

  const reportPost = await reddit.submitPost({
    subredditName: reportSubreddit,
    title: `${REPORT_TITLE_PREFIX} (${unansweredPosts.length})`,
    text: reportLines.join('\n'),
  });

  /*
   * Store the report post ID so only posts created by this app
   * can be deleted through the cleanup menu action.
   */
  const redisKey = getReportRedisKey(reportSubreddit);

  await redis.hSet(redisKey, {
    [reportPost.id]: new Date().toISOString(),
  });

  console.log(
    `Stored report post ${reportPost.id} in Redis key ${redisKey}.`
  );

  return reportPost;
};

export const deleteAllPrayerReports = async (): Promise<{
  deleted: number;
  unavailable: number;
  failed: number;
}> => {
  const reportSubreddit = context.subredditName;

  if (!reportSubreddit) {
    throw new Error('The current subreddit name is unavailable.');
  }

  const redisKey = getReportRedisKey(reportSubreddit);
  const reportIds = await redis.hKeys(redisKey);

  let deleted = 0;
  let unavailable = 0;
  let failed = 0;

  for (const reportId of reportIds) {
    /*
     * getPostById requires a Reddit post ID beginning with t3_.
     */
    if (!reportId.startsWith('t3_')) {
      console.warn(`Skipping invalid stored report ID: ${reportId}`);

      await redis.hDel(redisKey, [reportId]);
      unavailable += 1;
      continue;
    }

    try {
      const reportPost = await reddit.getPostById(
        reportId as `t3_${string}`
      );

      /*
       * Extra safety check. Only delete posts that still have
       * the report title prefix used by this app.
       */
      if (!reportPost.title.startsWith(REPORT_TITLE_PREFIX)) {
        console.warn(
          `Skipping ${reportId} because its title is not a prayer report.`
        );

        await redis.hDel(redisKey, [reportId]);
        unavailable += 1;
        continue;
      }

      await reportPost.delete();
      await redis.hDel(redisKey, [reportId]);

      deleted += 1;

      console.log(`Deleted prayer report ${reportId}.`);
    } catch (error) {
      console.error(`Failed to delete prayer report ${reportId}:`, error);

      /*
       * The post may already have been deleted manually. Remove its
       * tracking entry so future cleanup attempts do not retry it.
       */
      await redis.hDel(redisKey, [reportId]);
      failed += 1;
    }
  }

  return {
    deleted,
    unavailable,
    failed,
  };
};
