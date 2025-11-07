import Cookies from 'js-cookie';

export const useAuth = () => {
  const handleLogout = async () => {
    const accessToken = Cookies.get('access_token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: 'include',
      });

      if (response.ok) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('userRole');
        Cookies.remove('userId');
        window.location.href = '/welcome';
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return {
    handleLogout,
  };
};