from server import init_db
check = raw_input('are you sure you want to delete the database? [Y/n] ')
if check == 'Y':
	init_db('database.db','objectSchema.sql')
	print 'database cleared'
