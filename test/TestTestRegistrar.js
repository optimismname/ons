const TestRegistrar = artifacts.require('TestRegistrar.sol');
const ONS = artifacts.require('ONSRegistry.sol');

const { exceptions, evm } = require('@optimismname/test-utils');
const namehash = require('op-ons-namehash');
const sha3 = require('web3-utils').sha3;

contract('TestRegistrar', function (accounts) {

    let node;
    let registrar, ons;

    beforeEach(async () => {
        node = namehash.hash('op');

        ons = await ONS.new();
        registrar = await TestRegistrar.new(ons.address, '0x0');

        await ons.setOwner('0x0', registrar.address, {from: accounts[0]})
    });

    it('registers names', async () => {
        await registrar.register(sha3('op'), accounts[0], {from: accounts[0]});
        assert.equal(await ons.owner('0x0'), registrar.address);
        assert.equal(await ons.owner(node), accounts[0]);
    });

    it('forbids transferring names within the test period', async () => {
        await registrar.register(sha3('op'), accounts[1], {from: accounts[0]});
        await exceptions.expectFailure(registrar.register(sha3('op'), accounts[0], {from: accounts[0]}));
    });

    it('allows claiming a name after the test period expires', async () => {
        await registrar.register(sha3('op'), accounts[1], {from: accounts[0]});
        assert.equal(await ons.owner(node), accounts[1]);

        await evm.advanceTime(28 * 24 * 60 * 60 + 1);

        await registrar.register(sha3('op'), accounts[0], {from: accounts[0]});
        assert.equal(await ons.owner(node), accounts[0]);
    });
});
