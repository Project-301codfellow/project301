DROP TABLE IF EXISTS words;
CREATE TABLE words
(
    id SERIAL PRIMARY KEY,
    term VARCHAR(255),
    description TEXT,
    image_url TEXT ,
    notes TEXT
);

INSERT INTO words
    (term,description,image_url,notes)
VALUES
    ('cat', 'mammal animal', 'https://dcist.com/wp-content/uploads/sites/3/2019/04/Gem2-1500x1346.jpg', 'need this' )