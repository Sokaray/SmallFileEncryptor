# SmallFileEncryptor

AES encryption for node.js
**Example:**
```javascript
var SFE = require('./smallfileencriptor.js');
	SFE.encryptBinary('./SomeDir/SomeFile.png', function(result){
	/**
	result is JSON: {path1,path2,{key,iv}}
	**/
	callback(result);
});
```
**Android decrypt example:**

```java
FileInputStream fis = new FileInputStream(encPath);
FileOutputStream fos = new FileOutputStream(readyPath);
byte[] secKey = Base64.decode(pass,Base64.DEFAULT);
byte[] secIv = Base64.decode(iv,Base64.DEFAULT);
SecretKey key = new SecretKeySpec(secKey, "AES");
Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
IvParameterSpec ivParams = new IvParameterSpec(secIv);
cipher.init(Cipher.DECRYPT_MODE, key, ivParams);
CipherInputStream cis = new CipherInputStream(fis, cipher);
int b;
byte[] d = new byte[512];
 try {
    while ((b = cis.read(d)) != -1) {
	fos.write(d, 0, b);
    }
 }catch (Exception e){
  e.printStackTrace();
 }
fos.flush();
fos.close();
cis.close();
```
