-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    homeowner_id INT NOT NULL,
    tradesperson_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tradesperson_id) REFERENCES tradesperson_profiles(id) ON DELETE CASCADE,
    
    -- Ensure one rating per job
    UNIQUE KEY unique_job_rating (job_id)
);

-- Add indexes for faster queries
CREATE INDEX idx_ratings_tradesperson ON ratings(tradesperson_id);
CREATE INDEX idx_ratings_homeowner ON ratings(homeowner_id);
CREATE INDEX idx_ratings_job ON ratings(job_id);

-- Add has_rated column to jobs table
ALTER TABLE jobs 
ADD COLUMN has_rated TINYINT(1) DEFAULT 0 AFTER hired_at;o