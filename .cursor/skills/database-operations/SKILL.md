---
name: database-operations
description: SQL and MariaDB operations for WordPress - query optimization, security, character encoding, WordPress database patterns. Use when working with SQL queries, database configuration, or WordPress database operations.
---

# Database Operations (SQL/MariaDB + WordPress)

## Query Optimization

### Avoid SELECT *

```sql
-- ✅ Correct
SELECT id, title, status FROM wp_posts WHERE status = 'publish';

-- ❌ Wrong
SELECT * FROM wp_posts WHERE status = 'publish';
```

### Use LIMIT

```sql
SELECT id, title FROM wp_posts WHERE status = 'publish' LIMIT 10;
```

### Use Indexes

```sql
-- Check query performance
EXPLAIN SELECT id, title FROM wp_posts WHERE post_status = 'publish';

-- Add index if needed
CREATE INDEX idx_post_status ON wp_posts(post_status);
```

### Prefer JOINs over Subqueries

```sql
-- ✅ Better (JOIN)
SELECT p.id, p.title, pm.meta_value
FROM wp_posts p
JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE pm.meta_key = 'views';

-- ❌ Slower (subquery)
SELECT id, title, (SELECT meta_value FROM wp_postmeta WHERE post_id = wp_posts.ID AND meta_key = 'views') AS views
FROM wp_posts;
```

## Security

### Always Use Prepared Statements

```php
// ✅ Correct (WordPress)
global $wpdb;
$status = 'publish';
$results = $wpdb->get_results(
    $wpdb->prepare("SELECT id, title FROM wp_posts WHERE post_status = %s", $status)
);

// ❌ NEVER do this
$results = $wpdb->get_results("SELECT id, title FROM wp_posts WHERE post_status = '$status'");
```

### WordPress-Specific

```php
// Use WordPress functions when possible
$posts = get_posts(array(
    'post_status' => 'publish',
    'numberposts' => 10
));

// If SQL needed, use $wpdb->prepare()
$results = $wpdb->get_results($wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}custom_table WHERE user_id = %d",
    $user_id
));
```

## Character Encoding (utf8mb4)

### Database Creation

```sql
CREATE DATABASE db_name 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### Docker Configuration

```yaml
# docker-compose.yml
db:
  image: mariadb:latest
  command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
  environment:
    MYSQL_CHARSET: utf8mb4
    MYSQL_COLLATION: utf8mb4_unicode_ci
```

### Connection

```php
// WordPress wp-config.php already handles this
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');
```

## Data Integrity

### Transactions

```php
global $wpdb;

$wpdb->query('START TRANSACTION');

try {
    $wpdb->insert('wp_custom_table', array('name' => 'John'));
    $wpdb->insert('wp_related_table', array('ref_id' => $wpdb->insert_id));
    
    $wpdb->query('COMMIT');
} catch (Exception $e) {
    $wpdb->query('ROLLBACK');
    error_log('Transaction failed: ' . $e->getMessage());
}
```

### Use Appropriate Data Types

```sql
-- ✅ Correct
CREATE TABLE wp_custom (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    count INT DEFAULT 0,
    price DECIMAL(10,2),
    created_at DATETIME NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- ❌ Wrong (using VARCHAR for numbers/dates)
CREATE TABLE wp_custom (
    id VARCHAR(50),
    count VARCHAR(50),
    created_at VARCHAR(50)
);
```

## WordPress Database Patterns

### Use WordPress Functions

```php
// ✅ Correct
$post = get_post($post_id);
$meta = get_post_meta($post_id, 'custom_field', true);
update_post_meta($post_id, 'custom_field', $value);

// ❌ Avoid direct SQL when WordPress function exists
$wpdb->get_row("SELECT * FROM wp_posts WHERE ID = $post_id");
```

### WordPress Meta Tables

```php
// Leverage meta tables for flexible data
add_post_meta($post_id, 'views', 0);
$views = get_post_meta($post_id, 'views', true);
update_post_meta($post_id, 'views', $views + 1);
```

### Caching

```php
// Use transients for expensive queries
$results = get_transient('my_query_results');

if (false === $results) {
    global $wpdb;
    $results = $wpdb->get_results("SELECT ...");
    set_transient('my_query_results', $results, HOUR_IN_SECONDS);
}
```

### Avoid Queries in Loops

```php
// ❌ Wrong (N+1 problem)
foreach ($post_ids as $id) {
    $post = get_post($id);  // Query in loop!
}

// ✅ Correct
$posts = get_posts(array('include' => $post_ids));
```

## MariaDB-Specific

### InnoDB Storage Engine

```sql
CREATE TABLE wp_custom (
    ...
) ENGINE=InnoDB;  -- Use InnoDB, not MyISAM
```

### Health Check (Docker)

```yaml
db:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### Performance

```sql
-- Analyze table statistics
ANALYZE TABLE wp_posts;

-- Optimize table
OPTIMIZE TABLE wp_posts;
```

## Backup

```bash
# Export database
docker compose exec db mysqldump -u user -p database > backup.sql

# Import database
docker compose exec -T db mysql -u user -p database < backup.sql
```

## Debugging

### Enable Query Log

```php
// wp-config.php
define('SAVEQUERIES', true);

// Show queries
global $wpdb;
print_r($wpdb->queries);
```

### Check Slow Queries

```bash
docker compose exec db mysql -u root -p -e "SHOW FULL PROCESSLIST;"
```

### MariaDB Disk Full Recovery

**Symptoms:** Container shows `(unhealthy)`, logs contain:

```
ERROR mariadbd: Disk got full writing 'information_schema.(temporary)' (Errcode: 28 "No space left on device")
```

WordPress returns connection errors, GraphQL queries fail with `SocketError: other side closed`.

**Fix:**

```bash
# 1. Free disk space first (see docker-operations skill)
journalctl --vacuum-size=50M 2>/dev/null || true
docker system prune -af
df -h /  # Verify space freed

# 2. Restart MariaDB
docker restart wp-new-db
sleep 10

# 3. Verify recovery
docker logs --tail 5 wp-new-db
# Should show: "mariadbd: ready for connections"

# 4. Restart WordPress (workers may be stuck on failed DB connections)
docker restart wp-new-wordpress
sleep 8
```

MariaDB recovers automatically after restart if disk space is available — InnoDB replays the transaction log and resumes.

## Best Practices

✅ Use prepared statements ALWAYS  
✅ utf8mb4 character set  
✅ Use WordPress functions when available  
✅ Cache expensive queries (transients)  
✅ Use appropriate data types  
✅ Use InnoDB engine  
✅ Avoid queries in loops  
✅ Use indexes appropriately  

❌ Concatenate user input in SQL  
❌ Use SELECT *  
❌ Hardcode credentials  
❌ Use utf8 (use utf8mb4)  
❌ Query in loops  
❌ Use MyISAM engine  

## Project-Specific: УниДент

### Database Container

```yaml
# docker-compose.yml
db:
  image: mariadb:latest
  volumes:
    - db_data:/var/lib/mysql
  environment:
    MYSQL_DATABASE: wordpress
    MYSQL_USER: wpuser
    MYSQL_PASSWORD: ${DB_PASSWORD}
    MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
```

### Character Set

Already configured in Docker: utf8mb4 with utf8mb4_unicode_ci collation.
