import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Search, Palette, Briefcase, Presentation, Type, Layers, Smartphone, Megaphone, Target, Gift } from 'lucide-react';
import type { Blog } from '@/types';
import BlogCard from '@/components/shared/BlogCard';
import EmptyState from '@/components/shared/EmptyState';

const kategoriFilters = [
  { key: 'semua', label: 'Semua', icon: '🏷️' },
  { key: 'trending', label: 'Trending', icon: '🔥' },
  { key: 'design', label: 'Design', icon: Palette },
  { key: 'bisnis', label: 'Bisnis', icon: Briefcase },
  { key: 'presentasi', label: 'Presentasi', icon: Presentation },
  { key: 'font', label: 'Font', icon: Type },
  { key: 'icon', label: 'Icon', icon: Layers },
  { key: 'tutorial', label: 'Tutorial', icon: Smartphone },
  { key: 'update', label: 'Update', icon: Megaphone },
  { key: 'misi', label: 'Misi', icon: Target },
  { key: 'gratis', label: 'Gratis', icon: Gift },
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [activeKategori, setActiveKategori] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    let q = query(
      collection(db, 'blogs'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const blogList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      if (blogList.length > 0) {
        setFeaturedBlog(blogList[0]);
        setBlogs(blogList.slice(1));
      } else {
        setFeaturedBlog(null);
        setBlogs([]);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    if (activeKategori === 'semua') return true;
    if (activeKategori === 'trending') return blog.views > 5000;
    return blog.kategori.includes(activeKategori);
  }).filter((blog) => {
    if (!searchQuery) return true;
    return blog.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
           blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">📝 Blog & Tutorial</h1>
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tips, tutorial, update..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-pill text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {kategoriFilters.map((kat) => (
            <button
              key={kat.key}
              onClick={() => setActiveKategori(kat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
                activeKategori === kat.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {typeof kat.icon === 'string' ? (
                <span>{kat.icon}</span>
              ) : (
                <kat.icon className="w-3.5 h-3.5" />
              )}
              {kat.label}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featuredBlog && activeKategori === 'semua' && !searchQuery && (
          <div className="mb-8">
            <BlogCard blog={featuredBlog} featured />
          </div>
        )}

        {/* Blog Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <EmptyState type="blogs" />
        )}

        {/* Newsletter */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary-light rounded-card p-6 text-white">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-bold mb-2">💌 Newsletter</h3>
            <p className="text-sm text-white/80 mb-4">Dapatkan update & template gratis!</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@kamu.com"
                className="flex-1 px-4 py-2.5 rounded-pill text-gray-800 text-sm focus:outline-none"
              />
              <button className="px-6 py-2.5 bg-secondary text-white rounded-pill text-sm font-semibold hover:bg-secondary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
