const namehash = require('op-ons-namehash');
const sha3 = require('web3-utils').sha3;

const ONS = artifacts.require('ONSRegistryWithFallback.sol');

const ONSWithoutFallback = artifacts.require("ONSRegistry.sol");

contract('ONSRegistryWithFallback', function (accounts) {

    let old;
    let ons;

    beforeEach(async () => {
        old = await ONSWithoutFallback.new();
        ons = await ONS.new(old.address);
    });

    it('should allow setting the record', async () => {
        let result = await ons.setRecord('0x0', accounts[1], accounts[2], 3600, {from: accounts[0]});
        assert.equal(result.logs.length, 3);

        assert.equal((await ons.owner('0x0')), accounts[1]);
        assert.equal((await ons.resolver('0x0')), accounts[2]);
        assert.equal((await ons.ttl('0x0')).toNumber(), 3600);
    });

    it('should allow setting subnode records', async () => {
        let result = await ons.setSubnodeRecord('0x0', sha3('test'), accounts[1], accounts[2], 3600, {from: accounts[0]});

        let hash = namehash.hash("test");
        assert.equal(await ons.owner(hash), accounts[1]);
        assert.equal(await ons.resolver(hash), accounts[2]);
        assert.equal((await ons.ttl(hash)).toNumber(), 3600);
    });

    it('should implement authorisations/operators', async () => {
        await ons.setApprovalForAll(accounts[1], true, {from: accounts[0]});
        await ons.setOwner("0x0", accounts[2], {from: accounts[1]});
        assert.equal(await ons.owner("0x0"), accounts[2]);
    });

    describe('fallback', async () => {

        let hash = namehash.hash('op');

        beforeEach(async () => {
            await old.setSubnodeOwner('0x0', sha3('op'), accounts[0], {from: accounts[0]});
        });

        it('should use fallback ttl if owner not set', async () => {
            let hash = namehash.hash('op')
            await old.setSubnodeOwner('0x0', sha3('op'), accounts[0], {from: accounts[0]});
            await old.setTTL(hash, 3600, {from: accounts[0]});
            assert.equal((await ons.ttl(hash)).toNumber(), 3600);
        });

        it('should use fallback owner if owner not set', async () => {
            await old.setOwner(hash, accounts[0], {from: accounts[0]});
            assert.equal(await ons.owner(hash), accounts[0]);
        });

        it('should use fallback resolver if owner not set', async () => {
            await old.setResolver(hash, accounts[0], {from: accounts[0]});
            assert.equal(await ons.resolver(hash), accounts[0]);
        });
    });
});
