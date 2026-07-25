import { useState } from 'react';
import { useCreateJobMutation } from './jobQueries';
import styles from './CreateJobForm.module.scss';

interface CreateJobFormProps {
  onSuccess?: () => void;
}

export const CreateJobForm = ({ onSuccess }: CreateJobFormProps) => {
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('JUNIOR');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const createMutation = useCreateJobMutation();
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};
  
  if (!title.trim()) newErrors.title = 'Job title is required';
  if (!experience.trim()) newErrors.experience = 'Experience is required';
  if (!description.trim()) newErrors.description = 'Description is required';
  if (description.length < 10) newErrors.description = 'Description must be at least 10 characters';
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) return;
  
  try {
    await createMutation.mutateAsync({ title, position, experience, description });
    setTitle('');
    setPosition('JUNIOR');
    setExperience('');
    setDescription('');
    setErrors({});
    onSuccess?.();
    
  } catch (error: any) {
    setErrors({ submit: error?.response?.data?.message || 'Failed to create job' });
  }
};
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Job Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior React Developer"
            disabled={createMutation.isPending}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Position *</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={createMutation.isPending}
          >
            <option value="JUNIOR">Junior</option>
            <option value="MIDDLE">Middle</option>
            <option value="SENIOR">Senior</option>
            <option value="STAFF">Staff</option>
          </select>
         
        </div>

        <div className={styles.formGroup}>
          <label>Experience *</label>
          <input
            type="text"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 3-5 years"
            disabled={createMutation.isPending}
          />
           {errors.experience && <span className={styles.errorText}>{errors.experience}</span>}
          
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Job Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter job description..."
          rows={4}
          disabled={createMutation.isPending}
        />
        {errors.description && <span className={styles.errorText}>{errors.description}</span>}
      
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className={styles.btnSubmit}
      >
        {createMutation.isPending ? 'Creating...' : 'Create Job'}
      </button>

      {createMutation.isError && (
        <p className={styles.error}>Failed to create job. Please try again.</p>
      )}
    </form>
  );
};