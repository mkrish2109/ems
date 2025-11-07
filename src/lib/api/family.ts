import Cookies from 'js-cookie';

export class FamilyService {
  static async convertToFamilyHead() {
    const accessToken = Cookies.get('access_token');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/family/convert`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to convert to family head');
    }

    return res.json();
  }
}