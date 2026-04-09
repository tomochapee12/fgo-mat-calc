export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-700 bg-gray-900 px-4 py-4 text-xs text-gray-500 space-y-2">
      <p>
        本サイトはFate/Grand Orderの非公式ファンツールです。営利目的ではありません。
      </p>
      <p>
        ©TYPE-MOON / FGO PROJECT
      </p>
      <p>
        Game data provided by{' '}
        <a
          href="https://atlasacademy.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-yellow-400 underline"
        >
          Atlas Academy
        </a>
        {' '}(ODC-BY 1.0)
      </p>
    </footer>
  );
}
