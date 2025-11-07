import { Button } from '@repo/ui/button';
import Image, { type ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'src'> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="dark:hidden" />
      <Image {...rest} src={srcDark} className="hidden dark:block" />
    </>
  );
};

export default async function Home() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-20 gap-16 sm:p-8 sm:pb-20">
      <main className="flex flex-col gap-8 row-start-2 sm:items-center">
        {/* Tailwind CSS Test Section */}
        <div className="mb-6 rounded-lg border-2 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
            ✨ Tailwind CSS v4 is Working!
          </h3>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            This card is styled with Tailwind utility classes.
          </p>
        </div>

        <ThemeImage
          className="dark:invert"
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono pl-0 m-0 text-sm leading-6 tracking-tighter list-inside sm:text-center">
          <li className="mb-2 last:mb-0">
            Get started by editing <code className="font-[inherit] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-semibold">apps/web/app/page.tsx</code>
          </li>
          <li className="mb-2 last:mb-0">Save and see your changes instantly.</li>
          <li className="mb-2 last:mb-0">
            <a href="/tasks" className="text-blue-600 dark:text-blue-400 underline hover:underline-offset-4">
              Go to Tasks Manager →
            </a>
          </li>
        </ol>

        <div className="flex gap-4 sm:flex-col">
          <a
            className="appearance-none rounded-full h-12 px-5 border-none font-sans border border-transparent transition-all cursor-pointer flex items-center justify-center text-base leading-5 font-medium bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="https://vercel.com/new/clone?demo-description=Learn+to+implement+a+monorepo+with+a+two+Next.js+sites+that+has+installed+three+local+packages.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4K8ZISWAzJ8X1504ca0zmC%2F0b21a1c6246add355e55816278ef54bc%2FBasic.png&demo-title=Monorepo+with+Turborepo&demo-url=https%3A%2F%2Fexamples-basic-web.vercel.sh%2F&from=templates&project-name=Monorepo+with+Turborepo&repository-name=monorepo-turborepo&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fturborepo%2Ftree%2Fmain%2Fexamples%2Fbasic&root-directory=apps%2Fdocs&skippable-integrations=1&teamSlug=vercel&utm_source=create-turbo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://turborepo.com/docs?utm_source"
            target="_blank"
            rel="noopener noreferrer"
            className="appearance-none rounded-full h-12 px-5 border-none font-sans transition-all cursor-pointer flex items-center justify-center text-base leading-5 font-medium bg-transparent border border-black/10 dark:border-white/20 min-w-[180px] sm:min-w-0 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent"
          >
            Read our docs
          </a>
        </div>

        <Button appName="web" className="appearance-none rounded-full h-12 px-5 border-none font-sans transition-all cursor-pointer flex items-center justify-center text-base leading-5 font-medium bg-transparent border border-black/10 dark:border-white/20 min-w-[180px] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent">
          Open alert
        </Button>

        <div className="flex gap-4 sm:flex-col">
          <a
            href="/tasks"
            className="appearance-none rounded-full h-12 px-5 border-none font-sans transition-all cursor-pointer flex items-center justify-center text-base leading-5 font-medium bg-transparent border border-black/10 dark:border-white/20 min-w-[180px] sm:min-w-0 no-underline hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent"
          >
            View Tasks →
          </a>
        </div>
      </main>

      <footer className="font-sans row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turborepo.com?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to turborepo.com →
        </a>
      </footer>
    </div>
  );
}
