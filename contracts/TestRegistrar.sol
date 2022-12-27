pragma solidity ^0.7.0;

import "./ONS.sol";

/**
 * A registrar that allocates subdomains to the first person to claim them, but
 * expires registrations a fixed period after they're initially claimed.
 */
contract TestRegistrar {
    uint constant registrationPeriod = 4 weeks;

    ONS public ons;
    bytes32 public rootNode;
    mapping (bytes32 => uint) public expiryTimes;

    /**
     * Constructor.
     * @param onsAddr The address of the ONS registry.
     * @param node The node that this registrar administers.
     */
    constructor(ONS onsAddr, bytes32 node) public {
        ons = onsAddr;
        rootNode = node;
    }

    /**
     * Register a name that's not currently registered
     * @param label The hash of the label to register.
     * @param owner The address of the new owner.
     */
    function register(bytes32 label, address owner) public {
        require(expiryTimes[label] < block.timestamp);

        expiryTimes[label] = block.timestamp + registrationPeriod;
        ens.setSubnodeOwner(rootNode, label, owner);
    }
}
