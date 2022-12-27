const namehash = require('op-ons-namehash');
const sha3 = require('web3-utils').sha3;

const { exceptions } = require("@optimismname/test-utils")

let contracts = [
    [artifacts.require('ONSRegistry.sol'), 'Solidity']
];

contracts.forEach(function ([ONS, lang]) {
    contract('ONS ' + lang, function (accounts) {

        let ons;

        beforeEach(async () => {
            ons = await ONS.new();
        });

        it('should allow ownership transfers', async () => {
            let addr = '0x0000000000000000000000000000000000001234';

            let result = await ons.setOwner('0x0', addr, {from: accounts[0]});

            assert.equal(await ons.owner('0x0'), addr)

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.owner, addr);
        });

        it('should prohibit transfers by non-owners', async () => {
            await exceptions.expectFailure(
                ons.setOwner('0x1', '0x0000000000000000000000000000000000001234', {from: accounts[0]})
            );
        });

        it('should allow setting resolvers', async () => {
            let addr = '0x0000000000000000000000000000000000001234'

            let result = await ons.setResolver('0x0', addr, {from: accounts[0]});

            assert.equal(await ons.resolver('0x0'), addr);

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.resolver, addr);
        });

        it('should prevent setting resolvers by non-owners', async () => {
            await exceptions.expectFailure(
                ons.setResolver('0x1', '0x0000000000000000000000000000000000001234', {from: accounts[0]})
            );
        });

        it('should allow setting the TTL', async () => {
            let result = await ons.setTTL('0x0', 3600, {from: accounts[0]});

            assert.equal((await ons.ttl('0x0')).toNumber(), 3600);

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.ttl.toNumber(), 3600);
        });

        it('should prevent setting the TTL by non-owners', async () => {
            await exceptions.expectFailure(ons.setTTL('0x1', 3600, {from: accounts[0]}));
        });

        it('should allow the creation of subnodes', async () => {
            let result = await ons.setSubnodeOwner('0x0', sha3('op'), accounts[1], {from: accounts[0]});

            assert.equal(await ons.owner(namehash.hash('op')), accounts[1]);

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.label, sha3('op'));
            assert.equal(args.owner, accounts[1]);
        });

        it('should prohibit subnode creation by non-owners', async () => {
            await exceptions.expectFailure(ons.setSubnodeOwner('0x0', sha3('op'), accounts[1], {from: accounts[1]}));
        });
    });
});
