# SmallFileEncryptor
AES encryption for node.js
Example:
```javascript
var SFE = require('./smallfileencriptor.js');
	SFE.encryptBinary('./SomeDir/SomeFile.png', function(result){
	/**
	result is JSON: {path1,path2,{key,iv}}
	**/
	callback(result);
});
