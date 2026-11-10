CREATE DATABASE healthly;
USE healthly;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    handle VARCHAR(50) UNIQUE,
    bio VARCHAR(255),
    goal VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    isVerified TINYINT NOT NULL DEFAULT 0,
    professionalType VARCHAR(30)
);

CREATE TABLE follows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    followerId INT,
    followingId INT,

    UNIQUE (followerId, followingId),
    FOREIGN KEY (followerId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (followingId)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(1000),
    diet VARCHAR(20),
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userId INT,

    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE post_medias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data LONGBLOB NOT NULL,
    position INT NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    postId INT,

    FOREIGN KEY (postId)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userId INT,
    postId INT,

    UNIQUE (userId, postId),
    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (postId)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE saved_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userId INT,
    postId INT,

    UNIQUE (userId, postId),
    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (postId)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE reposts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userId INT,
    postId INT,

    UNIQUE (userId, postId),
    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (postId)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text VARCHAR(500) NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userId INT,
    postId INT,

    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (postId)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE TABLE comment_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userId INT,
    commentId INT,

    UNIQUE (userId, commentId),
    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (commentId)
        REFERENCES comments(id)
        ON DELETE CASCADE
);

CREATE TABLE hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE post_hashtags (
    postsId INT NOT NULL,
    hashtagsId INT NOT NULL,

    PRIMARY KEY (postsId, hashtagsId),
    FOREIGN KEY (postsId)
        REFERENCES posts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (hashtagsId)
        REFERENCES hashtags(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(20) NOT NULL,
    readAt DATETIME,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    recipientId INT,
    actorId INT,
    postId INT,
    commentId INT,

    FOREIGN KEY (recipientId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (actorId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (postId)
        REFERENCES posts(id)
        ON DELETE CASCADE,
    FOREIGN KEY (commentId)
        REFERENCES comments(id)
        ON DELETE CASCADE
);

CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lastMessageAt DATETIME(6),
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userAId INT,
    userBId INT,

    UNIQUE (userAId, userBId),
    FOREIGN KEY (userAId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (userBId)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text VARCHAR(1000) NOT NULL,
    readAt DATETIME(6),
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    conversationId INT,
    senderId INT,

    FOREIGN KEY (conversationId)
        REFERENCES conversations(id)
        ON DELETE CASCADE,
    FOREIGN KEY (senderId)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE professional_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(30) NOT NULL,
    registryNumber VARCHAR(30) NOT NULL,
    document LONGBLOB NOT NULL,
    documentMimeType VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewedAt DATETIME(6),
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    userId INT,
    reviewedById INT,

    FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (reviewedById)
        REFERENCES users(id)
        ON DELETE SET NULL
);
