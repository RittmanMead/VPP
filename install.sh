# The OBIEE installation folder
export FMW_HOME=/app/oracle/biee

# Adminstrator username/password
export WLS_USER=weblogic
export WLS_PASSWORD=Admin123

# Hostname and port of the WebLogic Server Administration Server
export ADMINSERVER_HOST=localhost
export ADMINSERVER_PORT=7001

# Where to copy the rmvpp plugin - it will be run and hosted here, this is a permanent path. 
# NB this is the parent folder - rmvpp will be created within it. 
# If deploying to a cluster make sure this is mounted on each managed server host
export RMVPP_DEPLOY_PATH=/u01/deployments 

## ----------------------------------------------------------------------------------------------------------------
##
## Check paths
if [ ! -d "$FMW_HOME" ]; then
	echo ' '
	echo 'OBIEE installation folder ($FMW_HOME) not found'
	echo ' '
	echo '**INSTALLATION ABORTED** '
	echo ' '
	echo ' '
	exit 1
fi

if [ ! -d "$FMW_HOME/Oracle_BI1" ]; then
	echo ' '
	echo 'OBIEE binaries folder ($FMW_HOME/OracleBI1) not found'
	echo '**INSTALLATION ABORTED** '
	echo ' '
	echo ' '
	exit 1
fi

if [ ! -d "$FMW_HOME/user_projects" ]; then
	echo ' '
	echo 'OBIEE WLS config folder ($FMW_HOME/user_projects) not found'
	echo ' '
	echo '**INSTALLATION ABORTED** '
	echo ' '
	echo ' '
	exit 1
fi


## Copy the RMVPP plugin to its host folder
mkdir -p $RMVPP_DEPLOY_PATH
if [ $? -ne 0 ]; then
	echo ' '
	echo 'Failed to create deployment folder ($RMVPP_DEPLOY_PATH)'
	echo ' '
	echo '**INSTALLATION ABORTED** '
	echo ' '
	echo ' '
	exit 1
fi

cp -r rmvpp $RMVPP_DEPLOY_PATH
if [ $? -ne 0 ]; then
	echo ' '
	echo 'Failed to copy RMVPP files to deploy folder ($RMVPP_DEPLOY_PATH)'
	echo ' '
	echo '**INSTALLATION ABORTED** '
	echo ' '
	echo ' '
	exit 1
fi


## Deploy it as a WLS application
$FMW_HOME/oracle_common/common/bin/wlst.sh <<EOF
connect('$WLS_USER','$WLS_PASSWORD','t3://$ADMINSERVER_HOST:$ADMINSERVER_PORT')
deploy('rmvpp','$RMVPP_DEPLOY_PATH/rmvpp','bi_cluster', stageMode='nostage')
exit()
EOF

## Patch the OBIEE common.js files, one still needs to be done manually on 11.1.1.9
# This would be better done as loop based on a search of all common.js under $FMW_HOME
# For now it's a hardcoded hack.
cp $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7dezjl/war/res/b_mozilla/common.js $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7dezjl/war/res/b_mozilla/common.js.bak
cp $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7arqd/war/res/b_mozilla/common.js $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7arqd/war/res/b_mozilla/common.js.bak

cat>$FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7dezjl/war/res/b_mozilla/common.js<<"EOF"
var src = document.createElement('script');src.setAttribute("type", "text/JavaScript");src.setAttribute("src", "/rmvpp/rmvpp.js");parent.document.getElementsByTagName("head")[0].appendChild(src);
EOF
cat $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7dezjl/war/res/b_mozilla/common.js.bak >> $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7dezjl/war/res/b_mozilla/common.js

cat>$FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7arqd/war/res/b_mozilla/common.js<<"EOF"
var src = document.createElement('script');src.setAttribute("type", "text/JavaScript");src.setAttribute("src", "/rmvpp/rmvpp.js");parent.document.getElementsByTagName("head")[0].appendChild(src);
EOF
cat $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7arqd/war/res/b_mozilla/common.js.bak >> $FMW_HOME/user_projects/domains/bifoundation_domain/servers/bi_server1/tmp/_WL_user/analytics_11.1.1/7arqd/war/res/b_mozilla/common.js


## Restart the stack

echo 'Completed deployment. Update common.js files in accordance with the installation guide and restart OBIEE.'


