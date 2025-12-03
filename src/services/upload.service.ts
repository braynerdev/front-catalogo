const CLOUDINARY_CLOUD_NAME = 'dr49sszs0';
const CLOUDINARY_UPLOAD_PRESET = 'catalogo';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface UploadResponse {
  url: string;
  publicId: string;
}

export const uploadService = {
  async uploadImage(uri: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      throw error;
    }
  },
};
