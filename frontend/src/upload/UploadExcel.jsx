import React, { useState } from "react";
import {
  useToast,
  Box,
  Text,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Input,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import MainHeader from "@/shared/MainHeader";
import { Global } from "@emotion/react";

const FileUploadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { componentNames } = location.state || { componentNames: [] };

  const [selectedFiles, setSelectedFiles] = useState(
    Array(componentNames.length).fill(null)
  );
  const [fileContents, setFileContents] = useState({});
  const toast = useToast();

  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const updatedFiles = [...selectedFiles];
    updatedFiles[index] = file;
    setSelectedFiles(updatedFiles);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      let extractedData = {};

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(sheetName);
        if (jsonData.length < 2) return;


        const headers = jsonData[2];

        let rows = jsonData.slice(2);
        rows = rows.filter((row) => {
          const firstCell = row[0]?.toString().toLowerCase();
          return firstCell && !firstCell.includes("total:");
        });


        // let rollrows = jsonData.slice(3);
        // rollrows = rollrows.filter((row) => {
        //   const firstCell = row[0]?.toString().toLowerCase();
        //   return firstCell && !firstCell.includes("total:");
        // });

        const coheaders = jsonData[1];
        const corows = jsonData.slice(1);

        const nameIndex = headers.findIndex((header) =>
          header?.toString().toLowerCase().includes("studentname")
        );

        // console.log(nameIndex);

        const rollIndex = headers.findIndex((header) =>
          header?.toString().toLowerCase().includes("rollno")
        );
        // console.log(rollIndex);

        const totalmarksIndex = coheaders.findIndex((header) =>
          header?.toString().toLowerCase().includes("total marks")
        );
        // console.log(totalmarksIndex);

        // const endIndex = coheaders.findIndex((header) =>
        //   header?.toString().toLowerCase().includes("total:")
        // );
        // console.log(endIndex);


        // let validRows = rows;
        const totalRowIndex = rows.findIndex(
          (row) => row[0]?.toString().toLowerCase().includes("total:")
        );


        // const totalrollRowIndex = rollrows.findIndex(
        //   (row) => row[0]?.toString().toLowerCase().includes("total:")
        // );
        // console.log(totalRowIndex);

        const limitedRows = totalRowIndex !== -1 ? rows.slice(0, totalRowIndex) : rows;
        // const limitedrollRows = totalRowIndex !== -1 ? rows.slice(0, totalrollRowIndex) : rows;



        const studentNames =
          nameIndex !== -1 ? limitedRows.map((row) => row[nameIndex] || "") : [];
        const rollNumbers =
          rollIndex !== -1 ? limitedRows.map((row) => row[rollIndex] || "") : [];
        const totalmarks =
          totalmarksIndex !== -1
            ? corows.map((row) => row[totalmarksIndex] || "0")
            : [];


        console.log(studentNames);
        console.log(rollNumbers);



        let coData = {};
        let missingCOs = [];

        for (let i = 1; i <= 6; i++) {
          const coIndex = coheaders.findIndex((header) =>
            header?.toString().toLowerCase().startsWith(`total of co${i}`)
          );

          if (coIndex !== -1) {
            coData[`CO${i}`] = corows.map((row) => row[coIndex] || 0);
          } else {
            coData[`CO${i}`] = [];
            missingCOs.push(`CO${i}`);
          }
        }
        console.log(totalmarks);
        console.log(coData);

        if (Object.keys(coData).length > 0) {
          extractedData[sheetName] = {
            ...coData,
            studentNames,
            rollNumbers,
            totalmarks,
          };
        }
      });

      setFileContents((prev) => ({
        ...prev,
        ...extractedData,
      }));

      // setTimeout(()=>{
      //   toast({
      //     title: "Upload Successful",
      //     position: 'bottom-right',
      //     description: `${file.name} uploaded successfully!`,
      //     status: "success",
      //     duration: 2000,
      //     isClosable: true,
      //   });
      // },1000)
    };

    reader.readAsArrayBuffer(file);
  };

  const handleViewUploaded = () => {
    setTimeout(() => {
      toast({
        title: "Upload Successful",
        position: "bottom-right",
        description: "All files uploaded successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/uploaded-files", { state: { fileContents } });
    }, 2000); // 2-second delay
  };


  return (
    <>
      <MainHeader />
      <Global
        styles={{
          body: {
            background: "url('/b.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          },
        }}
      />
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="rgba(255, 255, 255, 0.7)"
        backdropFilter="blur(1px)"
        px={4}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card
            w="600px"
            bg="whiteAlpha.800"
            boxShadow="2xl"
            borderRadius="3xl"
            p={6}
            border="1px solid"
            borderColor="whiteAlpha.300"
          >
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="xl" textAlign="center" color="gray.800">
                  Upload Files
                </Heading>

                {componentNames.map((name, index) => (
                  <Box key={index}>
                    <Text fontSize="md" fontWeight="semibold" mb={2} color={"gray.600"}>
                      {name} - Upload File
                    </Text>
                    <Box
                      as="label"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      h="32"
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor="blue.500"
                      borderRadius="lg"
                      bg="blue.50"
                      _hover={{ bg: "blue.100" }}
                      cursor="pointer"
                      transition="all 0.3s"
                    >
                      <Icon as={UploadCloud} boxSize={8} color="blue.600" />
                      <Text color="gray.600">Click or Drag & Drop</Text>
                      <Input
                        type="file"
                        display="none"
                        onChange={(e) => handleFileChange(e, index)}
                        accept=".xlsx, .xls, .csv"
                      />
                    </Box>
                    {selectedFiles[index] && (
                      <Text fontSize="sm" color="green.500" mt={2}>
                        {selectedFiles[index].name}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </CardBody>
            <Button
              color="white"
              bg="blue.500"
              mt={4}
              _hover={{ bg: "blue.600" }}
              w="full"
              as={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewUploaded}
            >
              View Uploaded Files
            </Button>
          </Card>
        </motion.div>
      </Flex>
    </>
  );
};

export default FileUploadPage;
