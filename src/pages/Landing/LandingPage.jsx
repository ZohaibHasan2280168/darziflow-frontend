import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    // Ye aapko Role Selection page par le jayega
    navigate('/role-selection');
  };

  return (
    <div style={styles.container}>
      {/* 3D Scene - Spline Design */}
      <div style={styles.splineWrapper}>
        <iframe 
          src='https://my.spline.design/claritystream-MxkMl4rSJLf9P80e8HnT300P/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          title="DarziFlow 3D"
          style={{ pointerEvents: 'auto' }}
        ></iframe>
      </div>

      {/* Transparent Click Overlay - Just over the DarziFlow text area */}
      <div 
        onClick={handleStart}
        style={styles.clickableArea}
        title="Click to Enter DarziFlow"
      />

      
      
    </div>
  );
};

// Styles optimized for Dark Theme and Karachi Internet (Fast loading layout)
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: '#000', // Deep black to match Spline background
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splineWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  clickableArea: {
    position: 'absolute',
    top: '40%', // Adjust based on your text position
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '450px', // Matches the width of "DarziFlow" text
    height: '180px',
    cursor: 'pointer',
    zIndex: 10,
    // border: '1px solid rgba(255,255,255,0.1)', // Uncomment to see the clickable box for testing
  },
  
};

export default LandingPage;
