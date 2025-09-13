'use server';

import {promises as fs} from 'fs';
import {File, formidable} from 'formidable';

export async function uploadCertificate(
  formData: FormData
): Promise<{fileDataUri: string; error?: string}> {
  try {
    const file = formData.get('certificate') as File;

    if (!file) {
      return {fileDataUri: '', error: 'No file uploaded.'};
    }

    // This is a temporary workaround for a bug in Next.js.
    // We should be able to get the file content directly from the FormData.
    const formidableFile = (await formidable().parse(
      new Request('https://f.f', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': `multipart/form-data; boundary=--${
            (Math.random() + 1).toString(36).substring(7)
          }`,
        },
      })
    )) as any;

    const filePath = formidableFile[1].certificate[0].filepath;
    const fileContent = await fs.readFile(filePath);
    const fileDataUri = `data:${file.type};base64,${fileContent.toString(
      'base64'
    )}`;

    return {fileDataUri};
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      fileDataUri: '',
      error: 'An error occurred while uploading the file.',
    };
  }
}
