build: clean install js_pack js_lib_pack test doc

install:
	npm install

JS_TARGETS := $(shell find ./public/app/js/source/*.js -type f)
JS_MIN_EXPORT = ./public/app/js/hunter.js
js_pack: $(JS_TARGETS)
	rm -Rf $(JS_MIN_EXPORT)
	java -jar ./tools/closure/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS $(addprefix --js=,$^) > $(JS_MIN_EXPORT)
	#java -jar ./tools/closure/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS $(addprefix --js=,$^) > $(JS_MIN_EXPORT)

JS_LIB_TARGETS := $(shell find ./public/app/js/source/lib/*.js -type f)
JS_LIB_MIN_EXPORT = ./public/app/js/lib/jquery-plugins.min.js
JS_LIB_EXPORT = ./public/app/js/lib/jquery-plugins.js
js_lib_pack: $(JS_LIB_TARGETS)
	rm -Rf $(JS_LIB_MIN_EXPORT)
	java -jar ./tools/closure/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS $(addprefix --js=,$^) > $(JS_LIB_MIN_EXPORT)
	#java -jar ./tools/closure/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS $(addprefix --js=,$^) > $(JS_LIB_MIN_EXPORT)
	rm -Rf $(JS_LIB_EXPORT)
	cat $^ > $(JS_LIB_EXPORT)

JSDOCDIR := ./tools/jsdoc
JSDOC_TARGETS := $(shell find ./server -type f -name "*.js")
doc:
	java -jar $(JSDOCDIR)/jsrun.jar $(JSDOCDIR)/app/run.js $(JSDOC_TARGETS) -t=$(JSDOCDIR)/templates/jsdoc -d=./doc -a

test:
	./test/mocha/run.sh

clean:
	rm -rf node_modules/*

DBIMPORTDATA := $(shell ls ./test/db/import)
db_import:
	echo 'db.dropDatabase()' | mongo hunter
	for x in $(basename ${DBIMPORTDATA}); do\
		mongoimport -h localhost -d hunter -c $$x ./test/db/import/$$x.json;\
	done

DBEXPORTDATA := $(shell ls ./test/db/export)
db_export:
	for x in $(basename ${DBEXPORTDATA}); do\
		mongoexport -h localhost -d hunter -c $$x > ./test/db/export/$$x.json;\
	done

.PHONY: build install js_pack js_lib_pack doc test clean db_import db_export
