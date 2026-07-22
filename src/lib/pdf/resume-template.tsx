import { Document, Page, Text, View, Link, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { CandidateContact, TailoredResume } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 42,
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: "#000000",
  },
  name: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  contactItem: {
    fontSize: 9.5,
  },
  contactSep: {
    fontSize: 9.5,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    marginBottom: 4,
    paddingBottom: 1,
  },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  entryTitle: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
  },
  entryDates: {
    fontFamily: "Times-Italic",
    fontSize: 10,
  },
  entrySubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entrySubtitle: {
    fontFamily: "Times-Italic",
    fontSize: 10,
  },
  bulletRow: {
    flexDirection: "row",
    marginLeft: 12,
    marginBottom: 1,
  },
  bulletMark: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.35,
  },
  skillsRow: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  plainLine: {
    fontSize: 10,
    marginBottom: 2,
  },
});

function ContactLine({ contact }: { contact: CandidateContact }) {
  const items: string[] = [];
  if (contact.phone) items.push(contact.phone);
  if (contact.email) items.push(contact.email);
  if (contact.location) items.push(contact.location);
  const links = contact.links.filter(Boolean);

  return (
    <View style={styles.contactRow}>
      {items.map((item, i) => (
        <Text key={`item-${i}`} style={styles.contactItem}>
          {item}
          {(i < items.length - 1 || links.length > 0) ? "  |  " : ""}
        </Text>
      ))}
      {links.map((link, i) => (
        <Link key={`link-${i}`} src={link.startsWith("http") ? link : `https://${link}`}>
          <Text style={styles.contactItem}>
            {link}
            {i < links.length - 1 ? "  |  " : ""}
          </Text>
        </Link>
      ))}
    </View>
  );
}

export function ResumeDocument({
  resume,
  contact,
}: {
  resume: TailoredResume;
  contact: CandidateContact;
}) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{contact.name}</Text>
        <ContactLine contact={contact} />

        {resume.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.plainLine}>{resume.summary}</Text>
          </View>
        ) : null}

        {resume.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((entry, i) => (
              <View key={i} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{entry.company}</Text>
                  <Text style={styles.entryDates}>{entry.dates}</Text>
                </View>
                <View style={styles.entrySubRow}>
                  <Text style={styles.entrySubtitle}>{entry.title}</Text>
                </View>
                {entry.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>{"•"}</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {resume.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, i) => (
              <View key={i} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{project.name}</Text>
                  {project.tech.length > 0 ? (
                    <Text style={styles.entryDates}>{project.tech.join(", ")}</Text>
                  ) : null}
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletText}>{project.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {resume.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <Text style={styles.skillsRow}>{resume.skills.join("  •  ")}</Text>
          </View>
        ) : null}

        {resume.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((line, i) => (
              <Text key={i} style={styles.plainLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export function renderResumePdf(resume: TailoredResume, contact: CandidateContact) {
  return renderToBuffer(<ResumeDocument resume={resume} contact={contact} />);
}
