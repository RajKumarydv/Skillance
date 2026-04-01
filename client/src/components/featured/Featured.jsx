import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Featured.scss';

const Featured = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = () => {
    if(search) {
      navigate(`/gigs?search=${search}`);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div className='featured'>
      <div className="container">

        <div className="left">
          {/* Win2000-style window panel */}
          <div className="win-hero-panel">
            <div className="win-hero-titlebar">
              <div className="win-titlebar-title">
                <span>&#128196;</span>
                <span>Welcome to Skilance - Freelance Services Marketplace</span>
              </div>
              <div className="win-titlebar-btns">
                <span title="Minimize">_</span>
                <span title="Maximize">&#9633;</span>
                <span title="Close" style={{color: 'red', fontWeight: 'bold'}}>&#x2715;</span>
              </div>
            </div>
            <div className="win-hero-body">
              <h1>Find the perfect <span>freelance</span> services for your business</h1>
            </div>
          </div>

          <div className="search">
            <div className="searchInput">
              <img src="./media/search.png" alt="search" />
              <input
                type="search"
                placeholder='Try "website"'
                onChange={(({ target: { value } }) => setSearch(value))}
                onKeyDown={handleKeyDown}
                className="win-input"
              />
            </div>
            <button onClick={handleSearch} className="win-btn">Search</button>
          </div>

          <div className="popular">
            <span>Popular:</span>
            <button>Website Design</button>
            <button>WordPress</button>
            <button>Logo Design</button>
            <button>AI Services</button>
          </div>
        </div>

        <div className="right">
          <img src="./media/hero.png" alt="hero" />
        </div>
        
      </div>
    </div>
  )
}

export default Featured
