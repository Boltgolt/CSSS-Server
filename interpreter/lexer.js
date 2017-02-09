var comparators = [
	"==",
	"!=",
	">=",
	"<=",
	">",
	"<"
]

var arithmetics = [
	"+",
	"-",
	"*",
	"/",
	"%"
]

module.exports = function(text, filename) {
	function pushToken(type, value) {
		tokens.push({
			type: type,
			value: value
		})
	}

	function next() {
		if (current == "\n") {
			line++
		}

		return current = text[++index]
	}

	var tokens = []
	var index = 0
	var line = 1
	var current

	while (index < text.length) {
		current = text[index]

		// Skip all whitespaces
		if (/[ |\t|\n]/.test(current)) {
			next()
		}

		// Skip all comments
		if (current + text[index + 1] == "/*") {
			while (current + text[index + 1] != "*/") {
				next()
			}

			// Skip to after the comment
			next(next())
		}

		// KEYWORD
		// All keywords start with an @ in CSSS
		else if (current == "@") {
			var keyword = ""

			while (/[a-zA-Z]/.test(next())) {
				keyword += current
			}

			pushToken("keyword", keyword)
		}

		// xPAR & xBRACE
		else if (current == "(") {
			pushToken("lpar", "(")
			next()
		}
		else if (current == ")") {
			pushToken("rpar", ")")
			next()
		}
		else if (current == "{") {
			pushToken("lbrace", "{")
			next()
		}
		else if (current == "}") {
			pushToken("rbrace", "}")
			next()
		}

		// SEMI
		else if (current == ";") {
			pushToken("semi", ";")
			next()
		}

		// VARIABLE
		// Just ignore the "var()" things, they're only here because of CSS
		else if (current + text[index + 1] + text[index + 2] == "var") {
			index += 3
		}
		// Capture the actual variable
		else if (current + text[index + 1] == "--") {
			var variable = current

			while (/\w|-/.test(next())) {
				variable += current
			}

			pushToken("variable", variable)
		}

		// COMPARATOR
		// Capture all 2-char comparators
		else if (comparators.indexOf(current + text[index + 1]) != -1) {
			pushToken("comparator", current + text[index + 1])
			next(next())
		}
		// And Capture the 1 char ones too
		else if (comparators.indexOf(current) != -1) {
			pushToken("comparator", current)
			next()
		}

		// ARITHMETIC
		else if (arithmetics.indexOf(current) != -1) {
			pushToken("arithmetic", current)
			next()
		}

		// ASSIGN
		else if (current == ":") {
			pushToken("assign", ":")
			next()
		}

		// STRING
		// Anything starting with "
		else if (/["|']/.test(current)) {
			var string = ""
			var closing = current

			while (next() != closing) {
				string += current
			}

			pushToken("string", string)
			next()
		}

		// FLOAT
		else if (/\d|\./.test(current)) {
			var float = ""

			while (/\d|\./.test(current)) {
				float += current
				next()
			}

			pushToken("float", float)
		}

		// IDENTIFIER
		else if (/[a-zA-Z]/.test(current)) {
			// Can sometimes match undefined, skip those
			if (typeof current == "undefined") {
				continue
			}

			var identifier = current

			while (/[a-zA-Z]/.test(next())) {
				identifier += current
			}

			pushToken("identifier", identifier)
		}

		// If it matches nothing else, and isn't a whitespace character, throw an error
		else if (current.charCodeAt(0) != 9 && current.charCodeAt(0) != 10) {
			parseError([
				`Lexer error: Invalid character "${current}".`,
				`In ${filename} at line ${line}.`,
			])
			return
		}
	}

	return tokens
}
