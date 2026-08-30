import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#5341db] via-[#8c74f2] to-[#f4f2fb] flex items-center justify-center p-4">
      
      {/* Decorative Circles Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top Left Giant Circle */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#422dbd]/40 rounded-full blur-2xl"></div>
        {/* Another Top Left Circle */}
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#2a1b91]/30 rounded-full blur-xl mix-blend-overlay"></div>
        
        {/* Bottom Right Giant Circle */}
        <div className="absolute -bottom-64 -right-20 w-[800px] h-[800px] bg-[#7561d5]/30 rounded-full blur-2xl"></div>
        {/* Another Bottom Right Circle */}
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-[#5341db]/40 rounded-full blur-xl"></div>
        
        {/* Bottom Left Circle */}
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-[#a89af0]/40 rounded-full blur-3xl"></div>

        {/* Small decorative dots pattern (Right Top) */}
        <div className="absolute top-40 right-40 opacity-30">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="5" r="3" fill="white"/>
            <circle cx="25" cy="5" r="3" fill="white"/>
            <circle cx="45" cy="5" r="3" fill="white"/>
            <circle cx="65" cy="5" r="3" fill="white"/>
            <circle cx="5" cy="25" r="3" fill="white"/>
            <circle cx="25" cy="25" r="3" fill="white"/>
            <circle cx="45" cy="25" r="3" fill="white"/>
            <circle cx="65" cy="25" r="3" fill="white"/>
            <circle cx="5" cy="45" r="3" fill="white"/>
            <circle cx="25" cy="45" r="3" fill="white"/>
            <circle cx="45" cy="45" r="3" fill="white"/>
            <circle cx="65" cy="45" r="3" fill="white"/>
          </svg>
        </div>

        {/* Small decorative dots pattern (Bottom Left) */}
        <div className="absolute bottom-40 left-40 opacity-30">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="5" r="3" fill="white"/>
            <circle cx="25" cy="5" r="3" fill="white"/>
            <circle cx="45" cy="5" r="3" fill="white"/>
            <circle cx="65" cy="5" r="3" fill="white"/>
            <circle cx="5" cy="25" r="3" fill="white"/>
            <circle cx="25" cy="25" r="3" fill="white"/>
            <circle cx="45" cy="25" r="3" fill="white"/>
            <circle cx="65" cy="25" r="3" fill="white"/>
            <circle cx="5" cy="45" r="3" fill="white"/>
            <circle cx="25" cy="45" r="3" fill="white"/>
            <circle cx="45" cy="45" r="3" fill="white"/>
            <circle cx="65" cy="45" r="3" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Main Content (Card) */}
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
      
    </div>
  );
};

export default AuthLayout;
