ALTER TABLE IF EXISTS ONLY card DROP CONSTRAINT IF EXISTS fk_card_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY card DROP CONSTRAINT IF EXISTS fk_card_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY board_status DROP CONSTRAINT IF EXISTS fk_board_status_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY board_status DROP CONSTRAINT IF EXISTS fk_board_status_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY card DROP CONSTRAINT IF EXISTS pk_card_id CASCADE;
ALTER TABLE IF EXISTS ONLY status DROP CONSTRAINT IF EXISTS pk_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY board DROP CONSTRAINT IF EXISTS pk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY board_status DROP CONSTRAINT IF EXISTS pk_board_status_id CASCADE;

DROP TABLE IF EXISTS status;
CREATE TABLE status (
  id serial NOT NULL,
  title text
);

DROP TABLE IF EXISTS board;
CREATE TABLE board (
  id serial NOT NULL,
  title text
);

DROP TABLE IF EXISTS card;
CREATE TABLE card (
  id serial NOT NULL,
  board_id integer,
  title text,
  status_id integer,
  index integer
);

DROP TABLE IF EXISTS board_status;
CREATE TABLE board_status (
  id serial NOT NULL,
  board_id integer,
  status_id integer
);


ALTER TABLE ONLY status
    ADD CONSTRAINT pk_status_id PRIMARY KEY (id);

ALTER TABLE ONLY board
    ADD CONSTRAINT pk_board_id PRIMARY KEY (id);

ALTER TABLE ONLY card
    ADD CONSTRAINT pk_card_id PRIMARY KEY (id);

ALTER TABLE ONLY board_status
    ADD CONSTRAINT pk_board_status_id PRIMARY KEY (id);

ALTER TABLE ONLY board_status
    ADD CONSTRAINT fk_board_status_board_id FOREIGN KEY (board_id) REFERENCES board(id);

ALTER TABLE ONLY board_status
    ADD CONSTRAINT fk_board_status_status_id FOREIGN KEY (status_id) REFERENCES status(id);

ALTER TABLE ONLY card
    ADD CONSTRAINT fk_card_board_id FOREIGN KEY (board_id) REFERENCES board(id);

ALTER TABLE ONLY card
    ADD CONSTRAINT fk_card_status_id FOREIGN KEY (status_id) REFERENCES status(id);

INSERT INTO board VALUES (1, 'Board 1');
INSERT INTO board VALUES (2, 'Board 2');
INSERT INTO board VALUES (3, 'Board 3');
SELECT pg_catalog.setval('board_id_seq', 3, true);

INSERT INTO status VALUES (0, 'new');
INSERT INTO status VALUES (1, 'in progress');
INSERT INTO status VALUES (2, 'testing');
INSERT INTO status VALUES (3, 'newcolumn');
INSERT INTO status VALUES (4, 'somecolumn');
SELECT pg_catalog.setval('status_id_seq', 4, true);

INSERT INTO card VALUES(1,1,'new card 1',4,0);
INSERT INTO card VALUES(2,1,'new card 2',0,1);
INSERT INTO card VALUES(3,1,'in progress card',1,0);
INSERT INTO card VALUES(4,1,'planning',2,0);
INSERT INTO card VALUES(5,1,'done card 1',3,0);
INSERT INTO card VALUES(16,1,'done card 1',1,0);
INSERT INTO card VALUES(6,1,'done card 1',3,1);
INSERT INTO card VALUES(7,2,'new card 1 2',0,0);
INSERT INTO card VALUES(8,2,'new card 2 2',0,1);
INSERT INTO card VALUES(9,2,'in progress card 2',1,0);
INSERT INTO card VALUES(10,2,'planning 2',2,0);
INSERT INTO card VALUES(11,2,'done card 1 2',3,0);
INSERT INTO card VALUES(12,2,'done card 1 2',3,1);
INSERT INTO card VALUES(13,2,'some new card 1 1',3,1);
SELECT pg_catalog.setval('card_id_seq', 13, true);

INSERT INTO board_status VALUES (1, 1, 0);
INSERT INTO board_status VALUES (2, 1, 1);
INSERT INTO board_status VALUES (3, 1, 2);
INSERT INTO board_status VALUES (4, 1, 3);
INSERT INTO board_status VALUES (5, 1, 4);
INSERT INTO board_status VALUES (6, 2, 0);
INSERT INTO board_status VALUES (7, 2, 1);
INSERT INTO board_status VALUES (8, 2, 2);
INSERT INTO board_status VALUES (9, 2, 3);
SELECT pg_catalog.setval('board_status_id_seq', 9, true);