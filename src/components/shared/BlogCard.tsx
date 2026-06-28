import { Link } from 'react-router-dom';
import { Eye, Star } from 'lucide-react';
import type { Blog } from '@/types';
import { formatDate } from '@/utils/dateHelpers';

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export default function BlogCard({ blog, featured = false }: BlogCardProps) {
  if (featured) {
    return (
      <Link to={`/blog/${blog.slug}`} className="group block">
        <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all overflow-hidden border border-gray-50">
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <img
              src={blog.thumbnail}
              alt={blog.judul}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=No+Image'; }}
            />
            {blog.videoUrl && (
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                <span>▶</span> Video
              </div>
            )}
            <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-white text-xs font-bold rounded">
              🔥 Trending
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.kategori.map((kat) => (
                <span key={kat} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize">
                  {kat}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {blog.judul}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{blog.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>👤 Tim Store</span>
              <span>📅 {formatDate(blog.publishedAt || null)}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.views.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${blog.slug}`} className="group block">
      <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all overflow-hidden border border-gray-50 h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 shrink-0">
          <img
            src={blog.thumbnail}
            alt={blog.judul}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=No+Image'; }}
          />
          {blog.videoUrl && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded flex items-center gap-1">
              <span>▶</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {blog.kategori.slice(0, 2).map((kat) => (
              <span key={kat} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full capitalize">
                {kat}
              </span>
            ))}
          </div>
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
            {blog.judul}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {blog.likes}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(blog.views / 1000).toFixed(1)}K</span>
            </div>
            <span className="text-primary font-medium">Baca →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
