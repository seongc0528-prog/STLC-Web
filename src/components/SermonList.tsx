type Sermon = {
  id: string;
  title: string;
  preacher: string | null;
  scripture: string | null;
  summary: string | null;
  video_url: string | null;
  file_url: string | null;
  published_at: string;
};

export function SermonList({ sermons }: { sermons: Sermon[] }) {
  if (sermons.length === 0) {
    return <p className="text-sm text-gray-400">등록된 게시물이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-gray-100">
      {sermons.map((s) => (
        <li key={s.id} className="py-4">
          <p className="text-xs text-gray-400">{new Date(s.published_at).toLocaleDateString()}</p>
          <h2 className="text-lg font-medium text-gray-900">{s.title}</h2>
          {(s.preacher || s.scripture) && (
            <p className="text-sm text-gray-500">
              {s.preacher} {s.scripture && `· ${s.scripture}`}
            </p>
          )}
          {s.summary && <p className="mt-1 text-sm text-gray-600">{s.summary}</p>}
          <div className="mt-2 flex gap-3">
            {s.video_url && (
              <a href={s.video_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                영상 보기
              </a>
            )}
            {s.file_url && (
              <a href={s.file_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                주보/첨부파일
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
