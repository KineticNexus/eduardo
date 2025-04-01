import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="landing">
      <div className="dark-overlay">
        <div className="landing-inner">
          <h1 className="x-large">Eduardo</h1>
          <p className="lead">
            A modern web application for your digital needs
          </p>
          <div className="buttons">
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-light">
              Login
            </Link>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Key Features</h2>
        
        <div className="features">
          <div className="feature">
            <h3>User Management</h3>
            <p>
              Secure and easy-to-use authentication system with role-based access control.
            </p>
          </div>
          
          <div className="feature">
            <h3>Data Integration</h3>
            <p>
              Seamlessly connect with various data sources and APIs for robust data processing.
            </p>
          </div>
          
          <div className="feature">
            <h3>Real-time Updates</h3>
            <p>
              Stay up-to-date with instant notifications and live data visualization.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;