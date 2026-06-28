import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ChevronLeft, Clock, Eye, Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
import type { Blog, Product, BlogComment } from '@/types';
import { formatDate } from '@/utils/dateHelpers';
import ProdukCard from '@/components/shared/ProdukCard';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const q = query(collection(db, 'blogs'), where('slug', '==', slug));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const blogData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Blog;
        setBlog(blogData);
        
        // Increment views
        updateDoc(doc(db, 'blogs', blogData.id), { views: increment(1) });

        // Fetch related products
        if (blogData.produkTerkait && blogData.produkTerkait.length > 0) {
          const productsUnsub = onSnapshot(
            query(collection(db, 'products'), where('__name__', 'in', blogData.produkTerkait.slice(0, 10))),
            (prodSnapshot) => {
              const prods = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
              setRelatedProducts(prods);
            }
          );
          return () => productsUnsub();
        }
      }
      setLoading(false);
    });

    // Fetch comments
    const commentsUnsub = onSnapshot(
      query(collection(db, 'blogComments'), where('blogId', '==', slug)),
      (snap) => {
        const cmts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogComment));
        setComments(cmts);
        setLoading(false);
      }
    );

    return () => { unsub(); commentsUnsub(); };
  }, [slug]);

  const handleLike = () => {
    if (blog && !liked) {
      updateDoc(doc(db, 'blogs', blog.id), { likes: increment(1) });
      setLiked(true);
    }
  };

  const handleComment = () => {
    if (!commentText.trim() || !blog) return;
    // Add comment to Firestore
    setCommentText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Artikel tidak ditemukan</h2>
        <Link to="/blog" className="text-primary hover:underline">← Kembali ke Blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link to="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Kembali ke Blog
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.kategori.map((kat) => (
            <span key={kat} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
              {kat}
            </span>
          ))}
          {blog.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {blog.judul}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <span>👤 Tim Store</span>
          <span>📅 {formatDate(blog.publishedAt || null)}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 8 menit baca</span>
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {blog.views.toLocaleString('id-ID')}x</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {comments.length}</span>
          <span className="flex items-center gap-1">❤️ {blog.likes}</span>
        </div>

        {/* Hero Image */}
        <div className="aspect-video rounded-card overflow-hidden bg-gray-100 mb-8">
          <img
            src={blog.thumbnail}
            alt={blog.judul}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=No+Image'; }}
          />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: blog.konten }}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-card shadow-card p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">💡 Lengkapi koleksi presentasi kamu:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((prod) => (
                <ProdukCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-card shadow-card p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">💬 Komentar ({comments.length})</h3>
          
          {/* Comment Input */}
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">U</span>
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tulis komentar..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleComment}
                className="px-4 py-2.5 bg-primary text-white rounded-button hover:bg-primary-dark transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{c.userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{c.userName}</span>
                      <span className="text-xs text-gray-400">2 jam lalu</span>
                    </div>
                    <p className="text-sm text-gray-600">{c.konten}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {c.likes}
                      </button>
                      <button className="text-xs text-gray-400 hover:text-primary flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> Balas
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-6">Belum ada komentar</p>
          )}
        </div>
      </article>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 z-50 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:mt-8 lg:mb-10 lg:max-w-3xl lg:mx-auto lg:px-4">
        <div className="flex items-center justify-around max-w-md mx-auto lg:max-w-none lg:justify-start lg:gap-6">
          <button
            onClick={handleLike}
            className={`flex flex-col items-center gap-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            <span className="text-[10px]">Suka</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">Komentar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <Share2 className="w-5 h-5" />
            <span className="text-[10px]">Bagikan</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px]">Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
