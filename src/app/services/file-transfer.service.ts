import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Platform-agnostic helpers to download or share text files.
 */
@Injectable({
  providedIn: 'root',
})
export class FileTransferService {
  /**
   * Saves a UTF-8 text file. On web this triggers a download; on native it shares the file.
   *
   * @param filename - Suggested file name, including extension.
   * @param contents - File body.
   * @param mimeType - MIME type advertised to the browser or share sheet.
   */
  async saveTextFile(filename: string, contents: string, mimeType: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.shareNativeFile(filename, contents);
      return;
    }

    this.downloadInBrowser(filename, contents, mimeType);
  }

  private async shareNativeFile(filename: string, contents: string): Promise<void> {
    await Filesystem.writeFile({
      path: filename,
      data: contents,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    const { uri } = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    });

    await Share.share({
      title: filename,
      files: [uri],
    });
  }

  private downloadInBrowser(filename: string, contents: string, mimeType: string): void {
    const blob = new Blob([contents], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }
}
