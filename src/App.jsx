import { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { FiEdit2 } from 'react-icons/fi';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import CommentRow from './components/CommentRow';

const saveCommentsToLocalStorage = (comments) => {
  localStorage.setItem('comments', JSON.stringify(comments));
};

const getCommentsFromLocalStorage = () => {
  const saved = localStorage.getItem('comments');
  return saved ? JSON.parse(saved) : null;
};

function App() {
  const [comments, setComments] = useState([]);
  const [postTitles, setPostTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const commentsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const savedComments = getCommentsFromLocalStorage();
      
      if (savedComments) {
        setComments(savedComments);
        setLoading(false);
      }
      
      const [commentsResponse, postsResponse] = await Promise.all([
        fetch('https://jsonplaceholder.typicode.com/comments'),
        fetch('https://jsonplaceholder.typicode.com/posts')
      ]);
      
      if (!commentsResponse.ok) throw new Error('Failed to fetch comments');
      if (!postsResponse.ok) throw new Error('Failed to fetch posts');
      
      const [apiComments, posts] = await Promise.all([
        commentsResponse.json(),
        postsResponse.json()
      ]);
      
      const titlesMap = posts.reduce((acc, post) => ({
        ...acc,
        [post.id]: post.title
      }), {});
      
      setPostTitles(titlesMap);
      
      const finalComments = savedComments 
        ? apiComments.map(apiComment => 
            savedComments.find(c => c.id === apiComment.id) || apiComment
          )
        : apiComments;
      
      setComments(finalComments);
      saveCommentsToLocalStorage(finalComments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEditing = useCallback((field) => {
    setEditingField(field);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingField(null);
  }, []);

  const handleRowClick = useCallback((id) => {
    setEditingId(id);
  }, []);

  const saveEdit = useCallback((field, value) => {
    if (!editingId || !field) return;
    
    setIsSaving(true);
    
    setTimeout(() => {
      const updatedComments = comments.map(comment => {
        if (comment.id === editingId) {
          return { ...comment, [field]: value };
        }
        return comment;
      });
      
      setComments(updatedComments);
      saveCommentsToLocalStorage(updatedComments);
      setIsSaving(false);
      cancelEditing();
    }, 100);
  }, [editingId, comments, cancelEditing]);

  const filteredComments = useMemo(() => 
    comments.filter(comment => {
      const searchLower = searchTerm.toLowerCase();
      return (
        comment.email.toLowerCase().includes(searchLower) ||
        comment.name.toLowerCase().includes(searchLower) ||
        comment.body.toLowerCase().includes(searchLower)
      );
    }),
    [comments, searchTerm]
  );

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = useMemo(
    () => filteredComments.slice(indexOfFirstComment, indexOfLastComment),
    [filteredComments, indexOfFirstComment, indexOfLastComment]
  );
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  }, []);

  if (loading && comments.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button 
          className="retry-button"
          onClick={fetchData}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>Comments Dashboard</h1>
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
          />
        </div>
      </nav>

      <div className="table-container">
        <table className="comments-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Body</th>
              <th>Post</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-results">
                  No comments found matching your search.
                </td>
              </tr>
            ) : (
              currentComments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  postTitle={postTitles[comment.postId] || `Post ${comment.postId}`}
                  isEditing={editingId === comment.id}
                  editingField={editingId === comment.id ? editingField : null}
                  onStartEdit={startEditing}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                  isSaving={isSaving}
                  onRowClick={handleRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      
      <div className="pagination-info">
        Showing {indexOfFirstComment + 1}-{Math.min(indexOfLastComment, filteredComments.length)} of {filteredComments.length} results
      </div>
    </div>
  );
}

export default App;
