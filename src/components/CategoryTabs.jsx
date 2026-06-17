import React from 'react';
import { Music, Radio, Hammer, Sparkles, LayoutGrid } from 'lucide-react';

export default function CategoryTabs({ categories = [], selectedCategory, onSelectCategory }) {
  
  const getIcon = (id) => {
    switch (id) {
      case 'cypher':
        return <Music className="tab-icon" />;
      case 'djs':
        return <Radio className="tab-icon" />;
      case 'dance':
        return <Sparkles className="tab-icon" />;
      default:
        return <LayoutGrid className="tab-icon" />;
    }
  };

  // Find currently selected category info
  const activeCategory = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="section-header">
      <div className="section-title">
        {activeCategory ? activeCategory.name : 'All Categories'}
        {activeCategory && (
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '4px' }}>
            {activeCategory.description}
          </span>
        )}
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          <LayoutGrid className="tab-icon" size={16} />
          All
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {getIcon(cat.id)}
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
