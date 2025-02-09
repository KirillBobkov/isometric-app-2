import { Card, CardContent, Typography } from "@mui/material";

export const InfoCard = ({ title, content, bigTitle }: any) => {

  return (
    <Card
    color="text.primary"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          align="center"
          sx={{
            p: 2,
            mb: 1,
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
          gutterBottom
          variant="h5"
          component="div"
        >
          {title}
        </Typography>
        {bigTitle && (
          <Typography
            align="center"
            sx={{
              p: 2,
              mb: 0,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
            gutterBottom
            variant="h1"
            component="div"
          >
            {bigTitle}
          </Typography>
        )}
        {content && (
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
