INSERT INTO seo_pages (page_name, title, meta_description, keywords) VALUES
('/', 'Home | AllCarePros Canada', 'Find reliable local tradespeople in Canada for your home projects.', 'tradespeople, canada, home improvement'),
('/blog', 'Blog | AllCarePros Canada', 'Read our latest articles and tips on home maintenance and improvements.', 'blog, home tips, maintenance'),
('/admin', 'Admin Dashboard | AllCarePros Canada', 'Secure administrative dashboard for AllCarePros Canada.', 'admin, dashboard'),
('/tradesperson', 'Tradesperson Dashboard | AllCarePros Canada', 'Manage your jobs and leads in the tradesperson portal.', 'tradesperson, leads, dashboard'),
('/jobs', 'Create a Job | AllCarePros Canada', 'Post a job and get quotes from verified tradespeople.', 'post job, quotes, home repair'),
('/data-deletion', 'Data Deletion Request | AllCarePros Canada', 'Submit a request to permanently delete your account and associated data.', 'data deletion, privacy'),
('/auth/login', 'Login | AllCarePros Canada', 'Sign in to your AllCarePros account.', 'login, sign in'),
('/auth/register', 'Register | AllCarePros Canada', 'Create an account to start using AllCarePros.', 'register, sign up'),
('/auth/forgot-password', 'Forgot Password | AllCarePros Canada', 'Recover your account password.', 'forgot password, recovery'),
('/local-tradespeople', 'Service Directory | AllCarePros Canada', 'Browse our directory of local tradespeople across Canada.', 'directory, local services')
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    meta_description = VALUES(meta_description),
    keywords = VALUES(keywords);
