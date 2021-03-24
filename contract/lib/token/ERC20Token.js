'use strict';

class ERC20Token {

    constructor(name, symbol, decimals, owner, totalSupply, balanceOf, allowance) {
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
        this.owner = owner;
        this.totalSupply = totalSupply;
        this.balanceOf = balanceOf;
        this.allowance = allowance;
    }

    getName() {
        return this.name;
    }

    getSymbol() {
        return this.symbol;
    }

    getDecimals() {
        return this.decimals;
    }

    getOwner() {
        return this.owner;
    }

    getTotalSupply() {
        return this.totalSupply.toFixed(this.decimals);
    }

    getBalanceOf(owner) {
        if (this.balanceOf[`${owner}`] === undefined) {
            return undefined;
        }
        return parseFloat(this.balanceOf[`${owner}`].toFixed(this.decimals));
    }

    transfer(sender, receiver, value) {
        if (typeof(value) !== 'number' || value < 0) {
            throw new Error('Value must be positive number!');
        }
        value = parseFloat(value.toFixed(this.decimals));
        if (this.balanceOf[`${sender}`] === undefined) {
            throw new Error(`${sender} balance does not exists!`);
        }
        if (this.balanceOf[`${sender}`] < value) {
            throw new Error(`${sender} balance must be greater or equal to transfer value!`);
        }
        this.balanceOf[`${sender}`] -= value;
        if (this.balanceOf[`${receiver}`] === undefined) {
            this.balanceOf[`${receiver}`] = 0;
        }
        this.balanceOf[`${receiver}`] += value;
    }

    transferFrom(spender, owner, receiver, value) {
        if (typeof(value) !== 'number' || value < 0) {
            throw new Error('Value must be positive number!');
        }
        value = parseFloat(value.toFixed(this.decimals));
        if (this.allowance[`${spender}`] === undefined) {
            throw new Error(`${spender} allowance balance does not exists!`);
        }
        if (this.allowance[`${spender}`][`${owner}`] === undefined ) {
            throw new Error(`${spender} allowance balance on behalf of  ${owner} does not exists!`);
        }
        if (this.allowance[`${spender}`][`${owner}`] < value ) {
            throw new Error(`${spender} allowance balance on behalf of ${owner} must be greater or equal to transfer value!`);
        }
        this.allowance[`${spender}`][`${owner}`] -= value;
        this.transfer(owner, receiver, value);
    }

    approve(owner, spender, value) {
        if (typeof(value) !== 'number' || value < 0) {
            throw new Error('Value must be positive number!');
        }
        if (this.balanceOf[`${owner}`] < value ) {
            throw new Error(`${owner}  balance must be greater or equal to approve value!`);
        }
        value = parseFloat(value.toFixed(this.decimals));
        this.allowance[`${spender}`] = {
            [owner]: value
        };
    }

    getAllowance(spender, owner) {
        if (this.allowance[`${spender}`] === undefined) {
            return undefined;
        }
        if (this.allowance[`${spender}`][`${owner}`] === undefined ) {
            return undefined;
        }
        return this.allowance[`${spender}`][`${owner}`].toFixed(this.decimals);
    }

    mint(owner, value) {
        if (owner !== this.owner) {
            throw new Error(`${owner} does not have access to mint tokens`);
        }
        if (typeof(value) !== 'number' || value < 0) {
            throw new Error('Value must be positive number!');
        }
        value = parseFloat(value.toFixed(this.decimals));
        this.totalSupply += value;
    }

    static toBuffer(buffer) {
        return Buffer.from(JSON.stringify(buffer));
    }

    static deserializeToken(tokenData) {
        const tokenDetails = JSON.parse(tokenData.toString());
        const token = new ERC20Token(
            tokenDetails.name,
            tokenDetails.symbol, 
            tokenDetails.decimals, 
            tokenDetails.owner, 
            tokenDetails.totalSupply, 
            tokenDetails.balanceOf,  
            tokenDetails.allowance
        );
        return token;
    }
}

module.exports = ERC20Token;