"use client";
import Image from "next/image";

import { Grid, IconButton, Typography, Box } from "@mui/material";

const PlayButtonsP2P = ({
  gameOver,
  showRock,
  showPaper,
  showScissors,
  playRock,
  playPaper,
  playScissors,
}) => {
  return (
    <>
      <Grid
        container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Grid
          container
          sx={{
            display: "flex",
            justifyContent: "space-between",
            // bgcolor: "purple",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "33.33%",
            }}
          >
            <IconButton
              disabled={gameOver || (!showPaper && !showScissors)}
              onClick={() => playRock()}
              sx={{
                visibility: showRock ? "visible" : "hidden",
                // width: { xs: "30px", sm: "40px", md: "50px", lg: "60px" },
              }}
            >
              <Image src={"/rps_assets/rock.png"} height={60} width={60} />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "600",
                color: "#fff",
                visibility: showRock ? "visible" : "hidden",
                fontSize: { xs: ".5rem", sm: ".7rem", md: ".8rem", lg: "1rem" },
              }}
            >
              Rock
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "33.33%",
            }}
          >
            <IconButton
              disabled={gameOver || (!showRock && !showScissors)}
              onClick={() => playPaper()}
              sx={{ visibility: showPaper ? "visible" : "hidden" }}
            >
              <Image src={"/rps_assets/paper.png"} width={60} height={60} />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "600",
                color: "#fff",
                visibility: showPaper ? "visible" : "hidden",
                fontSize: { xs: ".5rem", sm: ".7rem", md: ".8rem", lg: "1rem" },
              }}
            >
              Paper
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "33.33%",
            }}
          >
            <IconButton
              disabled={gameOver || (!showRock && !showPaper)}
              onClick={() => playScissors()}
              sx={{ visibility: showScissors ? "visible" : "hidden" }}
            >
              <Image src={"/rps_assets/scissors.png"} width={60} height={60} />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "600",
                color: "#fff",
                visibility: showScissors ? "visible" : "hidden",
                fontSize: { xs: ".5rem", sm: ".7rem", md: ".8rem", lg: "1rem" },
              }}
            >
              Scissors
            </Typography>
          </Box>
        </Grid>

        {showRock && showPaper && showScissors && (
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#9f9f9f", fontWeight: "600" }}
            >
              Choose One
            </Typography>
          </Box>
        )}
      </Grid>
    </>
  );
};

export default PlayButtonsP2P;
