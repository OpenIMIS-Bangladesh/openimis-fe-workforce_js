import React, { useState, useEffect } from "react";
import { Button, Box, Grid, Paper, LinearProgress, Divider, Link, Typography } from "@material-ui/core";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles } from "@material-ui/styles";
import { isEisPath } from "../../utils/utils";


const useStyles = makeStyles((theme) => ({
    container: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    paper: theme.paper.paper,
    logo: {
        width: "45%",
        padding: theme.spacing(2),
    },
}));
export default function LoginHeader() {
    const classes = useStyles();
    return (
        <>
        <Box display="flex" justifyContent="flex-start" >
                <Button startIcon={<ArrowBackIcon />} href={isEisPath()?"https://eis-site-stage.skydigitalbd.com/":"https://cf-site-stage.skydigitalbd.com/"} variant="text" color="primary" style={{padding:"3px"}}>
                  Back
                </Button>
              </Box>
        <Grid item container direction="row" alignItems="center" justifyContent="center">
            <img className={classes.logo} src={"/api/workforce/logo"} />
            <>
                <div>
                    <Box
                        pl={2}
                        fontWeight="fontWeightBold"
                        fontSize="h6.fontSize"
                        textAlign="center"
                    >
                        শ্রম ও কর্মসংস্থান মন্ত্রণালয়
                    </Box>

                    <Divider
                        style={{
                            flex: '1 1 0%', // Shorthand for flex-grow, flex-shrink, flex-basis
                            marginTop: '1rem',
                            marginBottom: '1rem',
                            background: '#006273'
                        }}
                    />
                    <Box
                        pl={2}
                        fontWeight="fontWeightBold"
                        fontSize="h6.fontSize"
                        textAlign="center" /* Make sure all props are complete */
                    >
                     { isEisPath()? "ই.আই.এস. ম্যানেজমেন্ট সিস্টেম":  "শ্রমিক কল্যাণ সহায়তার আবেদন ব্যবস্থাপনা সিস্টেম"}
                    </Box>
                </div>
            </>
        </Grid>
        </>
        )
}