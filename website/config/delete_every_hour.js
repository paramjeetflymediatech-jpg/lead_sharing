
// ######### use this below code in the database to set delete user every one hour  #########


// ALTER TABLE tradesperson_ratings 
// MODIFY job_id INT NOT NULL,
// MODIFY homeowner_id INT NOT NULL,
// MODIFY tradesperson_id INT NOT NULL,
// ADD CONSTRAINT fk_ratings_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
// ADD CONSTRAINT fk_ratings_homeowner FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
// ADD CONSTRAINT fk_ratings_tradesperson FOREIGN KEY (tradesperson_id) REFERENCES users(id) ON DELETE CASCADE;



// SET GLOBAL event_scheduler = ON;


// CREATE EVENT IF NOT EXISTS cleanup_expired_deletions
// ON SCHEDULE EVERY 1 HOUR
// DO
//   DELETE FROM users 
//   WHERE is_deletion_pending = TRUE 
//   AND deletion_requested_at <= NOW() - INTERVAL 24 HOUR;
