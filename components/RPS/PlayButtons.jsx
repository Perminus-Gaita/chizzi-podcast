"use client";
import Image from "next/image";

import { Grid, IconButton, Typography, Box } from "@mui/material";

const PlayButtons = ({
  game_over,
  show_rock,
  show_paper,
  show_scissors,
  play_rock,
  play_paper,
  play_scissors,
  set_wait_opponent,
  player_score,
  computer_score,
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
              disabled={game_over || (!show_paper && !show_scissors)}
              onClick={() => play_rock()}
              sx={{
                visibility: show_rock ? "visible" : "hidden",
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
                visibility: show_rock ? "visible" : "hidden",
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
              disabled={game_over || (!show_rock && !show_scissors)}
              onClick={() => play_paper()}
              sx={{ visibility: show_paper ? "visible" : "hidden" }}
            >
              <Image src={"/rps_assets/paper.png"} width={60} height={60} />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "600",
                color: "#fff",
                visibility: show_paper ? "visible" : "hidden",
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
              disabled={game_over || (!show_rock && !show_paper)}
              onClick={() => play_scissors()}
              sx={{ visibility: show_scissors ? "visible" : "hidden" }}
            >
              <Image src={"/rps_assets/scissors.png"} width={60} height={60} />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "600",
                color: "#fff",
                visibility: show_scissors ? "visible" : "hidden",
                fontSize: { xs: ".5rem", sm: ".7rem", md: ".8rem", lg: "1rem" },
              }}
            >
              Scissors
            </Typography>
          </Box>
        </Grid>

        <Box>
          <Typography
            variant="caption"
            sx={{ color: "#9f9f9f", fontWeight: "600" }}
          >
            Choose One
          </Typography>
        </Box>
      </Grid>
    </>
  );
};

export default PlayButtons;
