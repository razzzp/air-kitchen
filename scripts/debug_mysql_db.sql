-- insert into `air-kitchen`.`test` (testField) values ('test value');

-- INSERT INTO `air-kitchen`.`test` (id,creation_date,test_field) VALUES (NULL,1669816929167,'test Value');
-- select * from `air-kitchen`.`order`;
-- select * from `air-kitchen`.`user`;
-- select * from `air-kitchen`.`local_credentials`;
use `air-kitchen`;
-- update `access_token_credentials` set expiryDate = now() where userId = 3;
select * from `access_token_credentials`;
select * from `access_token_credentials` where `access_token_credentials`.expiryDate > now();

-- delete from `access_token_credentials` where userId = 3;
-- delete from `refresh_token_credentials` where userId = 3;
select * from `refresh_token_credentials`;
-- select * from `air-kitchen`.`information__salePriceschema` where table_name ='air-kitchen';