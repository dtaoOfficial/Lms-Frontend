// src/components/EnrolledCourseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EnrolledCourseCard
 * - summary: {
 *     enrollment,
 *     course,
 *     courseId,
 *     courseTitle,
 *     courseSummary,
 *     totalVideos,
 *     videosCompleted,
 *     percent,
 *     lastWatchedVideoId,
 *     lastWatchedAt
 *   }
 */
export default function EnrolledCourseCard({ summary }) {
  const enrollment = summary?.enrollment || {};
  const courseId =
    enrollment?.getCourseId?.() ??
    enrollment?.courseId ??
    summary?.courseId ??
    summary?.course?.id ??
    summary?.course?._id ??
    null;

  const title = summary?.courseTitle ?? summary?.course?.title ?? 'Untitled Course';
  const desc = summary?.courseSummary ?? summary?.course?.description ?? '';
  const total = Number(summary?.totalVideos ?? 0);
  const completed = Number(summary?.videosCompleted ?? 0);
  const percent = Number.isFinite(summary?.percent) ? summary.percent : (total === 0 ? 0 : Math.round((completed * 10000) / total) / 100);
  const lastWatchedVideoId = summary?.lastWatchedVideoId ?? null;
  const lastWatchedAt = summary?.lastWatchedAt ?? null;

  const safeCourseHref = courseId ? `/student/courses/${courseId}${lastWatchedVideoId ? `?openVideo=${encodeURIComponent(lastWatchedVideoId)}` : ''}` : '#';

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold break-words">{title}</h3>
            {desc && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{desc}</p>}
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">{percent}%</div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 bg-indigo-600 rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, Number(percent || 0)))}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div>{completed}/{total} videos completed</div>
            <div className="text-right">
              {lastWatchedAt ? `Last: ${new Date(lastWatchedAt).toLocaleString()}` : 'No recent activity'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-3">
        {/* Use Link so router transition is client-side and stable */}
        {courseId ? (
          <>
            <Link
              to={safeCourseHref}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label={`Continue ${title}`}
            >
              Continue
            </Link>

            <Link
              to={`/student/courses/${courseId}`}
              className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label={`Open ${title}`}
            >
              Open
            </Link>
          </>
        ) : (
          <>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md cursor-not-allowed"
              disabled
              title="Course ID missing"
            >
              Continue
            </button>
            <button className="px-3 py-2 border rounded-md text-sm text-gray-500 cursor-not-allowed" disabled>
              Open
            </button>
          </>
        )}
      </div>
    </div>
  );
}
