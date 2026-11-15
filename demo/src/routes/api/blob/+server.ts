import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const form = await request.formData();
  const file = form.get('file');

  if (
    !(file instanceof File) ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 4 * 1024 * 1024
  ) {
    return Response.json(
      { error: 'Choose a JPG, PNG or WebP image under 4 MB' },
      { status: 400 }
    );
  }

  // Stage 1: replace this temporary response with the Vercel Blob put() code.
  return Response.json(
    { error: 'Complete the Stage 1 upload code first' },
    { status: 501 }
  );
};

export const GET: RequestHandler = async () => {
  // Stage 3: replace this empty list with the Vercel Blob list() code.
  return Response.json([]);
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { pathname } = await request.json();

  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith('tech-share/')
  ) {
    return Response.json(
      { error: 'Invalid pathname' },
      { status: 400 }
    );
  }

  // Stage 4: replace this temporary response with the Vercel Blob del() code.
  return Response.json(
    { error: 'Complete the Stage 4 delete code first' },
    { status: 501 }
  );
};
