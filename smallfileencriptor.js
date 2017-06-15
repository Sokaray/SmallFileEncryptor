var crypto = require("crypto");
var fs = require('fs');

var SFE = (function () {
//default configs
var defCipher = {
    keyLength:32,
    algo: "aes256",
    retAsBase64:true
};

var defPath = {
   workDir: "./applace/",
   encEx:".enc",
   decEx:".apk"
};

var defEnc = 'binary';
var defaultsFileRead = {
    flags: 'r',
    encoding: defEnc,
    autoClose: true
};

/**
 * KEY and IV generation
 * @param {Buffer or String} key it must 32-key length for aes256
 * @param {function} callback
 */
function getKeyIV(key, callback) {
    crypto.pseudoRandomBytes(16, function (err, ivBuff) {
        if (err) throw err;
        var keyBuff = undefined;
        if (!key instanceof Buffer) {
            keyBuff = new Buffer(key, defEnc);
        } else {
            keyBuff = key;
        }
        callback({
            iv: ivBuff,
            key: keyBuff
        });
    });
}

/**
 * Encrypt binary file
 * @param {String} filePath
 * @param {function} callback
 */
function encryptBinary(filePath,callback){
    getKeyIV( new Buffer(generateCode(defCipher.keyLength), defEnc), function (keyPair) { 
        encryptData(defCipher.algo, keyPair, filePath, function(result){
            callback(result);
        });
    });
}

/**
 *  Decrypt file
 * @param {String} filePath path to encrypted file
 * @param {JSON} keyPair key-IV JSON pair
 * @param {Boolean} isBase64 set TRUE if key and IV encoded to BASE64
 * @param {Boolean} delEncFile set TRUE if you need delete encrypted file after decrypting
 * @param {function} callback 
 */
function decryptBinary(filePath,keyPair, isBase64,delEncFile, callback) {
    var keys = keyPair;
    if (isBase64){
        keys = {iv: new Buffer(keyPair.iv,'base64'),key:new Buffer(keyPair.key, 'base64')};
    }
    decryptData(defCipher.algo, keys, filePath,function(result){
        if (delEncFile){
            fs.unlinkSync(filePath);
        }
        callback(result);
    });
}

function encryptData(cipher_alg, data, filepath1, callback) {
    var fName = generateCode(12) + defPath.encEx;
    var fPath = defPath.workDir +  fName;
    var cipher = crypto.createCipheriv(cipher_alg, data.key, data.iv);
    encryptFile(filepath1, fPath, cipher, function (result) {
        if (defCipher.retAsBase64){
                callback({path: fPath, name:  fName, data: {iv:data.iv.toString('base64'),key:data.key.toString('base64')}});
        }else{
            callback({path: fPath, name:  fName, data: data});
        }
    });
}

function decryptData(cipher_alg, data, filepath1, callback) {
    var decipher = crypto.createDecipheriv(cipher_alg, data.key, data.iv);
    var path = require('path');
    fileInfo = path.parse(filepath1);
    var outpath = fileInfo.dir + "/" + fileInfo.name + defPath.decEx;
    encryptFile(filepath1, outpath, decipher, function (result) {
        callback({path: outpath, name: fileInfo.name});
    });
}

function encryptFile(inputPath, outputPath, cipher, callback) {
    if (fs.existsSync(inputPath)) {
        var inputStream = fs.createReadStream(inputPath, defaultsFileRead);
        var outputStream = fs.createWriteStream(outputPath);

        inputStream.on('data', function (data) {
            var buf = new Buffer(cipher.update(data), defEnc);
            outputStream.write(buf);
        });

        inputStream.on('end', function () {
            try {
                var buf = new Buffer(cipher.final(defEnc), defEnc);
                outputStream.write(buf);
                outputStream.end();
                outputStream.on('close', function () {
                    return callback();
                });
            } catch (e) {
                fs.unlink(outputPath);
                console.log(e);
                return callback(e);
            }
        });
    } else {
        callback(undefined);
    }
};

//misc
function generateCode(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}


    
return {
        encryptBinary:encryptBinary,
        decryptBinary:decryptBinary
};
})();

module.exports = SFE;
