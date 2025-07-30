import { memo } from 'react';
import EditableCell from './EditableCell';

const CommentRow = memo(({ 
  comment, 
  postTitle, 
  isEditing, 
  editingField, 
  onStartEdit, 
  onSave, 
  onCancel, 
  isSaving,
  onRowClick
}) => {
  // Render counter for performance diagnostic
//  console.count('CommentRow render - id: ' + comment.id);

  return (
    <tr className={isEditing ? 'editing' : ''}>
      <td className="email-cell">{comment.email}</td>
      <td className="editable-cell">
        <EditableCell
          isEditing={isEditing && editingField === 'name'}
          value={comment.name}
          field="name"
          onEdit={() => {
            onRowClick(comment.id);
            onStartEdit('name');
          }}
          onSave={(value) => onSave('name', value)}
          onCancel={onCancel}
          isSaving={isSaving}
        />
      </td>
      <td className="editable-cell">
        <EditableCell
          isEditing={isEditing && editingField === 'body'}
          value={comment.body}
          field="comment"
          fieldType="textarea"
          onEdit={() => {
            onRowClick(comment.id);
            onStartEdit('body');
          }}
          onSave={(value) => onSave('body', value)}
          onCancel={onCancel}
          isSaving={isSaving}
        />
      </td>

      <td className="post-cell">{postTitle}</td>
    </tr>
  );
});

export default CommentRow;
