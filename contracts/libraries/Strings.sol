//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title String Utils
/// @author abhi3700, hosokawa-zen
library Strings {

    /// @notice Get string`s length
    function length(string memory _base) internal pure returns (uint256) {
        bytes memory _baseBytes = bytes(_base);
        return _baseBytes.length;
    }

    /// @notice Concat string
    function append(string memory _base, string memory second) internal pure returns (string memory) {
        return string(abi.encodePacked(_base, second));
    }

    /// @notice Get string`s substring
    /// @param _offset Substring`s start offset
    /// @param _length Substring`s length
    function slice(string memory _base, uint256 _offset, uint256 _length) internal pure returns (string memory) {
        bytes memory _baseBytes = bytes(_base);

        assert(uint256(_offset + _length) <= _baseBytes.length);

        string memory _tmp = new string(uint256(_length));
        bytes memory _tmpBytes = bytes(_tmp);

        uint256 j = 0;
        for (uint256 i = uint256(_offset); i < uint256(_offset + _length); i++) {
            _tmpBytes[j++] = _baseBytes[i];
        }

        return string(_tmpBytes);
    }

    /// @notice Get string`s uppercase
    function upper(string memory _base) internal pure returns (string memory) {
        bytes memory _baseBytes = bytes(_base);
        for (uint256 i = 0; i < _baseBytes.length; i++) {
            if (_baseBytes[i] >= 0x61 && _baseBytes[i] <= 0x7A) {
                _baseBytes[i] = bytes1(uint8(_baseBytes[i]) - 32);
            }
        }
        return string(_baseBytes);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /* bytes32 (fixed-size array) to bytes (dynamically-sized array) */
    function bytes32ToBytes(bytes32 _bytes32) internal pure returns (bytes memory){
        // string memory str = string(_bytes32);
        // TypeError: Explicit type conversion not allowed from "bytes32" to "string storage pointer"
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return bytesArray;
    }//
}
