const FIFSRegistrar = artifacts.require('FIFSRegistrar.sol');
const ONS = artifacts.require('ONSRegistry.sol');

const { exceptions } = require('@optimismname/test-utils');
const sha3 = require('web3-utils').sha3;
const namehash = require('op-ons-namehash');

contract('FIFSRegistrar', function (accounts) {

    let registrar, ons;

    beforeEach(async () => {
        ons = await ONS.new();
        registrar = await FIFSRegistrar.new(ons.address, '0x0');

        await ons.setOwner('0x0', registrar.address, {from: accounts[0]})
    });

    it('should allow registration of names', async () => {
        await registrar.register(sha3('op'), accounts[0], {from: accounts[0]});
        assert.equal(await ons.owner('0x0'), registrar.address);
        assert.equal(await ons.owner(namehash.hash('op')), accounts[0]);
    });

    describe('transferring names', async () => {

        beforeEach(async () => {
            await registrar.register(sha3('op'), accounts[0], {from: accounts[0]});
        });

        it('should allow transferring name to your own', async () => {
            await registrar.register(sha3('op'), accounts[1], {from: accounts[0]});
            assert.equal(await ons.owner(namehash.hash('op')), accounts[1]);
        });

        it('forbids transferring the name you do not own', async () => {
            await exceptions.expectFailure(registrar.register(sha3('op'), accounts[1], {from: accounts[1]}));
        });
    });
});
