% Installing RMVPP

# Introduction

RMVPP is a plug-in written by Rittman Mead for Oracle Business Intelligence Enterprise Edition (OBIEE). In enables the use of custom advanced data visualisations beyond what is natively possible within the product. This install guide is for **OBIEE 11.1.1.9**.

RMVPP is a self-contained set of code that is deployed in three phases:

* Standalone WebLogic Server (WLS) deployment
* Integration with existing OBIEE javascript file
* Restart OBIEE services

# Installation

This installation is to be run on the OBIEE server. It assumes that it is not a multi-node OBIEE cluster.

## Pre-requisites

As the system owner you need the following:

1. The **RMVPP installation files**, which you should have been provided already. Available from the [Git repository](https://github.com/RittmanMead/VPP).
2. Access to the Weblogic Console, e.g. `http://server:7001/console`.
3. Access to he home folder of your OBIEE installation (**FMW_HOME**)
4. Access to the folder in which you will store the RMVPP installation. This should be **outside of your OBIEE installation folder** so as to not interfere with upgrades and patching.
	* If your OBIEE installation is `/u01/app/oracle/product/fmw` then you may choose to home the RMVPP installation in `/u01/deployments/rmvpp`. This is just a suggestion, and you are free to use your own location strategy.

## Installation Script

This script is only certified for **11.1.1.9.x**. Please refer to manual installations for other versions. Make sure the Administration server is running before beginning installation.

1. Edit the script `/install.sh` and amend the **`export`** variables at the top of the script. No other changes are needed.
2. Run the `install.sh` script. It will run some WLST (WebLogic Scripting Tool) code to deploy RMVPP and update some `common.js` files.

## Manual Installation

If the script does not work, or you are using Windows for the OBIEE server, a manual installation can be attempted.

1. Deploy the `rmvpp` directory to Weblogic (see [here](http://www.rittmanmead.com/2010/12/oracle-bi-ee-11g-styles-skins-custom-xml-messages/) for a custom deployment example)
	* Deploy as an **application**
	* On all parts of the `bi_cluster` but not the `AdminServer`
	* Check *I will make the deployment accessible from the following location*
2. *Optional* Set the configuration for the deployment to allow automatic updating:
	* Servlet Reload Check (in seconds): 1
	* Resource Reload Check (in seconds): 1
	* JSP Page Check (in seconds): 1
3. Activate and start the deployment
4. Locate `common.js` files in the BI installation. Default locations for different versions shown below:

**11.1.1.7**

* `$FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7dezjl/war/res/b_mozilla/common.js`
* `$FMW_HOME/Oracle_BI1/bifoundation/web/appv2/res/b_mozilla/common.js`

**11.1.1.9**

**NOTE**: The subdirectory under `analytics` will have a randomly generated name, so you will need to find it manually.
* `$FMW_HOME/instances/instance1/tmp/OracleBIPresentationServicesComponent/coreapplication_obips1/earmanager/analytics/8mr0HxRkelhRp5pEz2uDoQ/res/b_mozilla/`


**12c**

**NOTE**: The subdirectory under `analytics` will have a randomly generated name, so you will need to find it manually.

* `$FMW_HOME/user_projects/domains/bi/servers/bi_server1/tmp/_WL_user/analytics/eiguw6/war/res/b_mozilla/common.js`
* `$FMW_HOME/user_projects/domains/bi/servers/bi_server1/tmp/_WL_user/analytics/za01ic/war/res/b_mozilla/common.js`
* `$FMW_HOME/user_projects/domains/bi/servers/obips1/tmp/earmanager/analytics/yFQcjPLJ6hS6h3PCt4KoZA/res/b_mozilla/common.js`

5. Prepend the following code to each file:

```
var src = document.createElement('script');src.setAttribute("type", "text/JavaScript");src.setAttribute("src", "/rmvpp/rmvpp.js");parent.document.getElementsByTagName("head")[0].appendChild(src);
```

6. Restart the OBIEE stack
