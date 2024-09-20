/**
 * `HelpFolderOptions` is an object with four properties: `name`, `indexFile`, `useLocale`, and
 * `useLocaleAsPrefix`.
 *
 * @property folder - The name of the folder.
 * @property indexFile - The name of the file that will be used as the index file for the folder.
 * @property useLocale - If true, the locale will be used to determine the folder to use.
 * @property useLocaleAsPrefix - If true, the locale will be used as a prefix for the help
 * folder. For example, if the locale is "en-US", the help folder will be inside "en-US/" folder.
 * If false, no locale will be used as a prefix.
 */
export type HelpFolderOptions = {
  path: string,
  folder?: string,
  indexFile?: string,
  useLocale?: boolean,
  useLocaleAsPrefix?: boolean
}

/**
 * helper function to retrieve the help html file accordingly with the current locale
 */
export function getHelpIndexUrl(locale: string, options: HelpFolderOptions): string {
    const { useLocale, useLocaleAsPrefix, indexFile, path, folder } = options;

    const localeFolder = useLocale ? `${locale}/` : null;
    const file = useLocaleAsPrefix ? `${locale}.${indexFile}` : indexFile ?? '';

    return [path, folder, `${localeFolder ? localeFolder : ''}${file}`]
      .filter(item => item !== undefined)
      .join('/');
  };